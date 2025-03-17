const fs = require('fs');
const path = require('path');
const prettier = require('prettier');
const { get } = require('lodash');
const { JSDOM } = require('jsdom');
const setting = require('../setting.json');

const replaceOrInsert = (parent, content, marker) => {
  const startComment = `start-${marker}`;
  const endComment = `end-${marker}`;
  const nodes = Array.from(parent.childNodes);
  const startIndex = nodes.findIndex(n => n.nodeType === 8 && n.nodeValue.includes(startComment));
  const endIndex = nodes.findIndex(n => n.nodeType === 8 && n.nodeValue.includes(endComment));
  // 创建新内容片段，并且精确删除旧内容
  const fragment = `<!--${startComment}--> ${content} <!--${endComment}-->`;
  if (startIndex > -1 && endIndex > -1 && startIndex < endIndex) {
    const deleteQueue = [];
    for (let i = startIndex; i <= endIndex; i++) {
      deleteQueue.push(nodes[i]);
    }
    deleteQueue.forEach(node => parent.removeChild(node));
  }
  // 插入新内容
  parent.insertAdjacentHTML('beforeend', fragment);
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

    // 处理head内容
    const headHtml = get(site, 'headHtml');
    if (headHtml) {
      replaceOrInsert(document.head, headHtml, 'head-custom-by-huasen');
    }
    // 处理body内容
    const bodyHtml = get(site, 'bodyHtml');
    if (bodyHtml) {
      replaceOrInsert(document.body, bodyHtml, 'body-custom-by-huasen');
    }
    // 保存修改后的HTML
    const updatedHtml = dom.serialize();
    const formatted = await prettier.format(updatedHtml, { parser: 'html', tabWidth: 2, printWidth: 300 });
    fs.writeFileSync(htmlPath, formatted, 'utf8');
    console.log('[Huasen Log]：初始化网站入口成功');
  } catch (error) {
    console.error('初始化站点异常：', error);
  }
})();
