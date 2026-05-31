const puppeteer = require('puppeteer');
const { tool } = require('huasen-lib');
let browser = null;
let isInitialized = false;

// 初始化浏览器池（避免冷启动延迟）
async function initBrowser() {
  browser = await puppeteer.launch({
    headless: 'new', // 使用新版无头模式
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu', // 禁用GPU加速
      '--single-process', // 单进程模式减少上下文切换
      '--no-zygote', // 禁止派生进程
      '--disable-dev-shm-usage' // 避免共享内存问题
    ],
    timeout: 1000 * 60, // 增加超时时间
  });
  isInitialized = true;
}

// 启动时初始化
tool.timeout2Interval(async () => {
  try {
    if (browser) browser.close();
    isInitialized = false;
    await initBrowser();
  } catch (error) {
    console.error('puppeteer初始化失败：', error);
  }
}, 3600 * 1000, true)

/**
 * 爬取React、Vue.js等单页面应用
 * @param {string} url - 目标地址
 * @returns {string}
 */

async function crawl(url) {
  if (!isInitialized || !url) return;
  try {
    page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', req => {
      const allowTypes = ['document', 'script', 'xhr', 'fetch', 'stylesheet', 'image', 'font'];
      allowTypes.includes(req.resourceType()) ? req.continue() : req.abort();
    });
    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 1000 * 60 // 设置超时时间
    });
    // 内存优化
    const html = await page.content();
    return html;
  } catch (error) {
    console.error('puppeteer渲染失败：', error);
  } finally {
    // 确保资源回收
    if (page && !page.isClosed()) await page.close();
  }
}

module.exports = {
  crawl
}