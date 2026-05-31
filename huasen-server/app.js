/*
 * @Autor: huasenjio
 * @Date: 2021-08-21 21:07:58
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-21 23:18:21
 * @Description: 程序入口文件
 */

const fs = require('fs');
const express = require('express');
const path = require('path');
const app = express();

// 启动端口
const { SITE, PORT_SERVER } = require('./config.js');
const { mountSEORoutes } = require('./plugin/seo/index.js');

// 引入程序
require('./plugin/log.js');
require('./plugin/initialize-site.js');
require('./schedule/schedule.js');
require('./mongodb/db.js');
require('./plugin/ws/ws.js');
require('./global/index.js');

// 全局中间件
const { handleBlackList, handleRequestError, handleRequest, handleRequestParams } = require('./middleware/common.middleware.js');

// 解决cors跨域问题
const cors = require('cors'); // cors跨域插件
app.use(cors());

// 请求体解析器
const bodyparser = require('body-parser');
app.use(bodyparser.json({ limit: '50mb' }));
app.use(bodyparser.urlencoded({ limit: '50mb', extended: false }));

// SEO路由
mountSEORoutes(app);

// 配置静态资源目录
app.use('/public', express.static(path.join(__dirname, './public')), (req, res) => res.status(404).end());
app.use('/bin', express.static(path.join(__dirname, '../bin')), (req, res) => res.status(404).end());
app.use('/huasen-store', express.static(path.join(__dirname, '../huasen-store')), (req, res) => res.status(404).end());

// 全局拦截
app.use(handleRequest, handleBlackList, handleRequestParams);

// 引入用户路由
app.use('/user', require('./router/user.router.js'));
app.use('/article', require('./router/article.router.js'));
app.use('/file', require('./router/file.router.js'));
app.use('/blacklist', require('./router/blacklist.router.js'));
app.use('/mail', require('./router/mail.router.js'));
app.use('/record', require('./router/record.router.js'));
app.use('/site', require('./router/site.router.js'));
app.use('/column', require('./router/column.router.js'));
app.use('/journal', require('./router/journal.router.js'));
app.use('/weather', require('./router/weather.router.js'));
app.use('/app', require('./router/app.router.js'));
app.use('/statistics', require('./router/statistics.router.js'));
app.use('/tag', require('./router/tag.router.js'));
app.use('/pin', require('./router/pin.router.js'));
app.use('/ai', require('./router/ai.router.js'));
app.use('/license', require('./router/license.router.js'));

// 404页面重定向
app.get('*', function (req, res) {
  res.redirect(SITE.redirectURL);
});

//  全局处理错误
app.use(handleRequestError);

// 启动服务
app.listen(PORT_SERVER, async () => {
  console.log(`[Huasen Log]：express 服务端口为${PORT_SERVER}`);
  const { shouldSyncOnBoot, syncLicenseWithOfficial } = require('./controller/license.controller.js');
  try {
    if (await shouldSyncOnBoot()) {
      syncLicenseWithOfficial({ preserveAbilityUserConfig: true })
        .then(result => console.log('[Huasen License] 启动同步完成：', result))
        .catch(err => console.warn('[Huasen License] 启动同步失败：', err.message));
    }
  } catch (err) {
    console.warn('[Huasen License] 启动同步检查失败：', err.message);
  }
});

// 全局未捕获的异常
process.on('uncaughtException', function (err) {
  global.huasen.formatError(err, '未捕获的全局错误');
});
