/*
 * @Autor: huasenjio
 * @Date: 2021-08-21 21:07:58
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-11-06 12:26:37
 * @Description: 程序入口文件
 */

const express = require('express');
const path = require('path');
const app = express();

// 启动端口
const { PORT_SERVER } = require('./config.js');

// 引入程序
const db = require('./mongodb/db.js');
const log = require('./plugin/log.js');
const ws = require('./plugin/ws/ws.js');
const schedule = require('./schedule/schedule.js');
const globalTool = require('./global/index.js');

// 全局中间件
const { handleAccessInformation, handleBlackList, handleRequestError, handleRequest, handleRequestParams } = require('./middleware/common.middleware.js');

// 解决cors跨域问题
const cors = require('cors'); // cors跨域插件
app.use(cors());

// 请求体解析器
const bodyparser = require('body-parser');
app.use(bodyparser.json({ limit: '50mb' }));
app.use(bodyparser.urlencoded({ limit: '50mb', extended: false }));

// 配置静态资源目录
app.use('/public', express.static(path.join(__dirname, './public')));
app.use('/huasen-store', express.static(path.join(__dirname, '../huasen-store')));

// 全局拦截
app.use(handleRequest, handleAccessInformation, handleBlackList, handleRequestParams);

// 引入用户路由
const UserRouter = require('./router/user.router.js');
const ManageRouter = require('./router/manage.router.js');
const ArticleRouter = require('./router/article.router.js');
const FileRouter = require('./router/file.router.js');
const BlacklistRouter = require('./router/blacklist.router.js');
const TakeRouter = require('./router/take.router.js');
const MailRouter = require('./router/mail.router.js');
const RecordRouter = require('./router/record.router.js');
app.use('/user', UserRouter);
app.use('/manage', ManageRouter);
app.use('/article', ArticleRouter);
app.use('/file', FileRouter);
app.use('/blacklist', BlacklistRouter);
app.use('/take', TakeRouter);
app.use('/mail', MailRouter);
app.use('/record', RecordRouter);

//  全局处理错误
app.use(handleRequestError);

// 启动服务
app.listen(PORT_SERVER, () => {
  console.log(`express：${PORT_SERVER}`);
});

// 全局未捕获的异常
process.on('uncaughtException', function (err) {
  global.huasen.formatError(err, '未捕获的全局错误');
});
