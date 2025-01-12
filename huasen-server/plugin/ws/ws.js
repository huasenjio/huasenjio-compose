/*
 * @Autor: huasenjio
 * @Date: 2022-08-21 21:03:42
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-12-14 22:17:10
 * @Description: 实时通讯
 */

const WebSocketServer = require('ws').Server;
const JWT = require('../../plugin/jwt.js');
const { WS, POOL_BLACKLIST } = require('../../config.js');
const { getSystemInformation } = require('./system.js');
const { getVisitorInformation } = require('./visitor.js');
const { isExistObjectFiledRedisItem } = require('../ioredis/map.js');
const { getClientIP } = require('../../utils/tool.js')

class WSServer {
  constructor() {
    this.WSClient = null;
    this.port = WS.port;

    // 初始化
    this.init();
  }
  // 初始化
  init() {
    try {
      this.WSClient = new WebSocketServer({ port: this.port });
      console.log(`websocket：${this.port}`);

      // 监听连接
      this.WSClient.on('connection', async (server, req) => {
        let ip = getClientIP(req)
        let token = req.url.split('?')[1].split('=')[1];
        const serverKey = `${ip}-${token}`
        // 认证通过
        JWT.verifyToken(token)
          .then(async ({ data }) => {
            const proof = data
            const { code } = proof;
            // 判断管理员权限
            if (code < 2) throw new Error('websocket authentication failed');
            // 判断黑名单
            let tag = await isExistObjectFiledRedisItem(POOL_BLACKLIST, ip);
            if (tag === 1) throw new Error('websocket blacklist');

            // 监听回调参数
            server.on('error', err => {
              throw err;
            });
            server.on('message', async msg => {
              const data = await this.receiveData(msg);
              this.sendMessage(data, server);
            });
            server.on('close', info => {
              server.close();
              console.log(`[WebSocket Log] ${serverKey} 正常断开连接：`, info);
            });
          })
          .catch(err => {
            server.close();
            console.error(`[WebSocket Log] ${serverKey} 异常断开连接：`, err);
          });
      });
    } catch (err) {
      console.error('websocket failure to start: ', err);
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
    return data;
  }

  // 响应消息到客户端
  sendMessage(data, server) {
    try {
      server.send(JSON.stringify(data));
    } catch (err) {
      console.error('websocket failure to send message', err);
    }
  }
}
const ws = new WSServer();
module.exports = {
  ws,
};
