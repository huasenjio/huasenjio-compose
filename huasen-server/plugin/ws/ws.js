/*
 * @Autor: huasenjio
 * @Date: 2022-08-21 21:03:42
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-20 21:23:48
 * @Description: 实时通讯
 */

const WebSocketServer = require('ws').Server;
const JWT = require('../../plugin/jwt.js');
const { WS } = require('../../config.js');
const readline = require('readline');
const { getSystemInformation } = require('./system.js');
const { getVisitorInformation } = require('./visitor.js');

class WSServer {
  constructor() {
    this.wsClient = null;
    this.wsServer = null;
    this.port = WS.port;

    // 初始化
    this.init();
  }
  // 初始化
  init() {
    try {
      this.wsClient = new WebSocketServer({ port: this.port });
      console.log(`websocket：${this.port}`);
      // 监听连接事件
      this.wsClient.on('connection', (server, req) => {
        this.wsServer = server;
        let token = req.url.split('?')[1].split('=')[1];
        // 认证通过
        JWT.verifyToken(token)
          .then(result => {
            // 保存连接对象
            this.wsServer = server;
            // 处理回调
            server.on('error', err => {
              this.handleError(err);
            });
            server.on('message', msg => {
              this.receiveData(msg);
            });
            server.on('close', info => {
              this.handleClose(info);
            });
          })
          .catch(err => {
            this.wsServer.close();
          });
      });
    } catch (err) {
      console.log('websocket failure to start');
      throw err;
    }
  }

  // 接受处理消息
  async receiveData(msg) {
    msg = msg.toString();
    let data = {};
    if (msg.includes('system')) {
      data.system = getSystemInformation();
    }
    if (msg.includes('visitor')) {
      data.visitor = await getVisitorInformation();
    }
    this.sendMessage(data);
  }

  // 消息返回前端
  sendMessage(data) {
    try {
      if (this.wsServer) {
        this.wsServer.send(JSON.stringify(data));
      }
    } catch (err) {
      console.log('websocket failure to send message');
      throw err;
    }
  }

  // 处理错误
  handleError(err) {
    this.wsClient = null;
    this.wsServer = null;
  }

  // 处理关闭
  handleClose(info) {
    this.wsClient = null;
    this.wsServer = null;
  }
}
const ws = new WSServer();
module.exports = {
  ws,
};
