const fs = require('fs');
const path = require('path');
const prettier = require('prettier');
const { get } = require('lodash');
const { JSDOM } = require('jsdom');
const { Validator } = require('huasen-lib');
const setting = require('../setting.json');
const { MODE } = require('../config.js');
const validator = new Validator();

const replaceOrInsert = (type, originalHtml, newContent, marker) => {
  const startMarker = `start-${marker}`;
  const endMarker = `end-${marker}`;
  const pattern = new RegExp(
    `<!-- ${startMarker} -->[\\s\\S]*?<!-- ${endMarker} -->`,
    'g'
  );
  const replacement = `<!-- ${startMarker} -->\n${newContent}\n<!-- ${endMarker} -->`;

  if (pattern.test(originalHtml)) {
    return originalHtml.replace(pattern, replacement);
  }
  // 根据标记类型决定插入位置
  if (type === 'head') {
    return originalHtml.replace(/<\/head>/i, `${replacement}</head>`);
  } else if (type === 'body') {
    return originalHtml.replace(/<\/body>/i, `${replacement}</body>`);
  }
};

(async () => {
  try {
    // 读取配置文件
    const site = get(setting, 'site', {});
    // 读取HTML文件
    const htmlPath = path.join(__dirname, '../public/webapp/portal/index.html');
    if (!fs.existsSync(htmlPath)) return
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    const dom = new JSDOM(htmlContent);
    const { document } = dom.window;

    // 基础信息配置
    const metaMappings = {
      'brandName': [
        { selector: 'title', property: 'textContent' },
      ],
      'brandUrl': [
        { selector: 'link[rel="icon"]', property: 'href' }
      ],
      'brandDescription': [
        { selector: 'meta[name="description"]', property: 'content' }
      ],
      'brandKeywords': [
        { selector: 'meta[name="keywords"]', property: 'content' }
      ]
    };
    // 批量设置meta信息
    Object.entries(metaMappings).forEach(([key, rules]) => {
      const value = get(site, key);
      rules.forEach(({ selector, property }) => {
        const element = document.querySelector(selector);
        if (element) element[property] = value;
      });
    });
    // 保存修改后的HTML
    let updatedHtml = dom.serialize();
    // 处理head内容
    const headHtml = get(site, 'headHtml') || '';
    updatedHtml = replaceOrInsert('head', updatedHtml, headHtml, 'head-custom-by-huasen');
    // 处理body内容
    const bodyHtml = get(site, 'bodyHtml') || '';
    updatedHtml = replaceOrInsert('body', updatedHtml, bodyHtml, 'body-custom-by-huasen');
    // const formatted = await prettier.format(updatedHtml, { parser: 'html' });
    fs.writeFileSync(htmlPath, updatedHtml, 'utf8');
    console.log('[Huasen Log]：初始化网站入口成功');
  } catch (error) {
    console.log('[Huasen Log]：初始化网站入口失败', error);
  }
})();
