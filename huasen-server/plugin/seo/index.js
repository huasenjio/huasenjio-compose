const path = require('path');
const ejs = require('ejs');
const { get } = require('lodash');

const setting = require('../../setting.json');
const { getJournalInformationById } = require('../../controller/journal.controller.js');
const { getPublicArticleSEOById } = require('../../controller/article.controller.js');
const { handleDetectCrawler } = require('../../middleware/common.middleware.js');
const { working } = require('../../service/index.js');
const { writeToFile } = require('../../utils/tool.js');

/**
 * @Description: 规范SEO域名
 * @param {string} origin - 域名字符串
 * @returns {string} 规范后的域名字符串
 */
function normalizeSEOOrigin(origin = '') {
  return String(origin || '').replace(/\/+$/, '');
}

/**
 * @Description: 获取SEO域名
 * @returns {string} 规范后的域名字符串
 */
function getSEOOrigin() {
  return normalizeSEOOrigin(get(setting, 'site.origin'));
}

/**
 * @Description: 构建SEO URL
 * @param {string} pathname - 路径名字符串
 * @returns {string} 完整的SEO URL字符串
 */
function buildSEOUrl(pathname = '') {
  const origin = getSEOOrigin();
  const normalizedPathname = String(pathname).replace(/^\/+/, '');
  if (!origin) return `/${normalizedPathname}`;
  return `${origin}/${normalizedPathname}`;
}

/**
 * @Description: 格式化ISO日期
 * @param {string|number} value - 日期值
 * @returns {string} 格式化后的ISO日期字符串
 */
function formatISODate(value) {
  if (!value) return '';
  return new Date(value).toISOString();
}

/**
 * @Description: 格式化站点地图日期
 * @param {string|number} value - 日期值
 * @returns {string} 格式化后的站点地图日期字符串
 */
function formatSitemapDate(value) {
  if (!value) return new Date().toISOString();
  return new Date(value).toISOString();
}

/**
 * @Description: 转义HTML字符
 * @param {string} value - 输入的HTML字符串
 * @returns {string} 转义后的HTML字符串
 */
function escapeHTML(value = '') {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/**
 * @Description: 创建SEO视图数据
 * @returns {object} SEO视图数据对象
 */
function createSEOViewData() {
  return {
    brandName: get(setting, 'site.brandName') || '',
    brandUrl: get(setting, 'site.brandUrl') || '',
    brandDescription: get(setting, 'site.brandDescription') || '',
    brandKeywords: get(setting, 'site.brandKeywords') || '',
    headHtml: get(setting, 'site.headHtml') || '',
    bodyHtml: get(setting, 'site.bodyHtml') || '',
    origin: getSEOOrigin(),
  };
}

/**
 * @Description: 构建导航专题SEO数据
 * @param {object} req - 请求对象
 * @param {object} journal - 导航专题对象
 * @returns {object} 导航专题SEO数据对象
 */
function buildJournalSEOData(req, journal) {
  const base = createSEOViewData();
  const canonicalUrl = buildSEOUrl(`seo/journal/${journal._id}?isSEO=1`);
  const siteCount = journal.series.reduce((total, item) => total + item.sites.length, 0);
  const description = `${journal.name}是${base.brandName}整理的导航专题，收录 ${journal.series.length} 个栏目与 ${siteCount} 个精选站点，帮助搜索引擎和访客快速了解专题内容。`;
  const keywords = [base.brandKeywords, journal.name, ...journal.series.map(item => item.typeName)].filter(Boolean).join(',');
  const itemList = [];
  journal.series.forEach(series => {
    series.sites.forEach(site => {
      itemList.push({
        '@type': 'ListItem',
        position: itemList.length + 1,
        url: site.url,
        name: site.name,
        description: site.description || '',
      });
    });
  });
  return {
    ...base,
    pageTitle: `${journal.name} - ${base.brandName}`,
    pageDescription: description,
    pageKeywords: keywords,
    canonicalUrl,
    realCanonicalUrl: `${base.origin}/#/home?journal=${journal._id}`,
    pageUrl: canonicalUrl,
    updatedAt: formatISODate(journal.updateTime || journal.creatTime),
    journal,
    siteCount,
    schemaJSON: JSON.stringify(
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: journal.name,
        description,
        url: canonicalUrl,
        dateModified: formatISODate(journal.updateTime || journal.creatTime),
        isPartOf: {
          '@type': 'WebSite',
          name: base.brandName,
          url: base.origin,
        },
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: itemList,
        },
      },
      null,
      2,
    ),
  };
}

/**
 * @Description: 构建文章SEO数据
 * @param {object} req - 请求对象
 * @param {object} article - 文章对象
 * @returns {object} 文章SEO数据对象
 */
function buildArticleSEOData(req, article) {
  const base = createSEOViewData();
  const canonicalUrl = buildSEOUrl(`seo/article/${article._id}?isSEO=1`);
  const coverUrl = article.cover;
  const description = article.excerpt || base.brandDescription;
  const keywords = [base.brandKeywords, ...article.tags].filter(Boolean).join(',');
  return {
    ...base,
    pageTitle: `${article.title} - ${base.brandName}`,
    pageDescription: description,
    pageKeywords: keywords,
    canonicalUrl,
    realCanonicalUrl: `${base.origin}/#/read/${article._id}`,
    pageUrl: canonicalUrl,
    coverUrl,
    updatedAt: formatISODate(article.updateTime || article.creatTime),
    createdAt: formatISODate(article.creatTime),
    article,
    articleHTML: escapeHTML(article.content || '').replace(/\n/g, '<br />'),
    schemaJSON: JSON.stringify(
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description,
        url: canonicalUrl,
        datePublished: formatISODate(article.creatTime),
        dateModified: formatISODate(article.updateTime || article.creatTime),
        keywords: article.tags.join(','),
        image: coverUrl ? [coverUrl] : undefined,
        author: {
          '@type': 'Organization',
          name: base.brandName,
        },
        publisher: {
          '@type': 'Organization',
          name: base.brandName,
          logo: base.brandUrl
            ? {
                '@type': 'ImageObject',
                url: base.brandUrl,
              }
            : undefined,
        },
        mainEntityOfPage: canonicalUrl,
      },
      null,
      2,
    ),
  };
}

/**
 * @Description: 渲染SEO页面
 * @param {string} templatePath 模板路径
 * @param {object} data 数据对象
 * @returns html 渲染后的HTML字符串
 */
async function renderSEOPage(templatePath, data) {
  return new Promise((resolve, reject) => {
    ejs.renderFile(templatePath, data, (err, html) => {
      if (err) return reject(err);
      resolve(html);
    });
  });
}

/**
 * @Description: 渲染SEO模板
 * @param {string} templateName - 模板文件名
 * @param {object} data - 模板数据
 * @returns {Promise<string>} 渲染后的字符串
 */
async function renderSEOTemplate(templateName = '', data = {}) {
  return renderSEOPage(path.resolve(__dirname, `../../public/seo-template/${templateName}`), data);
}

/**
 * @Description: 生成SEO静态资源
 * @param {number} code - 权限码
 */
async function generateSEOAssets(code = 0) {
  const sitemapPath = path.resolve(__dirname, '../../public/webapp/portal/sitemap.xml');
  const robotsPath = path.resolve(__dirname, '../../public/webapp/portal/robots.txt');
  const origin = getSEOOrigin();
  if (!origin) {
    throw new Error('SEO origin 未配置，已跳过 sitemap / robots 生成！');
  }
  const [err, journals, articles] = await working([
    {
      schemaName: 'journal',
      methodName: 'find',
      payloads: [
        {
          code: { $lte: code },
          enabled: true,
        },
        {
          _id: 1,
          updateTime: 1,
        },
      ],
    },
    {
      schemaName: 'article',
      methodName: 'find',
      payloads: [
        {
          code: { $lte: code },
          isDraft: false,
        },
        {
          _id: 1,
          updateTime: 1,
        },
      ],
    },
  ]);
  if (err) {
    throw err;
  }
  const urls = [];
  journals.forEach(item => {
    urls.push({
      loc: buildSEOUrl(`seo/journal/${item._id}?isSEO=1`),
      lastmod: formatSitemapDate(item.updateTime),
      changefreq: 'weekly',
      priority: '0.7',
    });
  });
  articles.forEach(item => {
    urls.push({
      loc: buildSEOUrl(`seo/article/${item._id}?isSEO=1`),
      lastmod: formatSitemapDate(item.updateTime),
      changefreq: 'daily',
      priority: '0.8',
    });
  });
  const sitemapXML = await renderSEOTemplate('sitemap.ejs', { urls });
  const robotsTXT = await renderSEOTemplate('robots.ejs', {
    sitemapUrl: buildSEOUrl('public/webapp/portal/sitemap.xml'),
  });
  await writeToFile(sitemapPath, sitemapXML);
  await writeToFile(robotsPath, robotsTXT);
}

/**
 * @Description: 处理专题SEO请求
 */
async function handleJournalSEO(req, res, next) {
  try {
    if (req.query.isSEO !== '1') {
      return res.status(404).send('Not Found');
    }
    const journal = await getJournalInformationById(req.params.journalId, 0);
    if (!journal) {
      return res.status(404).send('Not Found');
    }
    const html = await renderSEOPage(path.resolve(__dirname, '../../public/seo-template/journal.ejs'), buildJournalSEOData(req, journal));
    res.type('html').send(html);
  } catch (err) {
    next(err);
  }
}

/**
 * @Description: 处理文章SEO请求
 */
async function handleArticleSEO(req, res, next) {
  try {
    if (req.query.isSEO !== '1') {
      return res.status(404).send('Not Found');
    }
    const article = await getPublicArticleSEOById(req.params.articleId, 0);
    if (!article) {
      return res.status(404).send('Not Found');
    }
    const html = await renderSEOPage(path.resolve(__dirname, '../../public/seo-template/article.ejs'), buildArticleSEOData(req, article));
    res.type('html').send(html);
  } catch (err) {
    next(err);
  }
}

/**
 * @Description: 挂载SEO路由
 * @param {*} app
 */
function mountSEORoutes(app) {
  app.get('/seo/journal/:journalId', handleDetectCrawler, handleJournalSEO);
  app.get('/seo/article/:articleId', handleDetectCrawler, handleArticleSEO);
}

module.exports = {
  mountSEORoutes,
  generateSEOAssets,
};
