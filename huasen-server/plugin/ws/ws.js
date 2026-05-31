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
const { getEmptyVisitorInformation, getVisitorInformation } = require('./visitor.js');
const { isExistObjectFiledRedisItem } = require('../ioredis/map.js');
const { getClientIP } = require('../../utils/tool.js');

const WS_VISITOR_TIMEOUT = 3000;
const WS_REDIS_TIMEOUT = 1500;

const withTimeout = (promise, timeout, fallback) => {
  return Promise.race([
    promise,
    new Promise(resolve => {
      setTimeout(() => resolve(fallback), timeout);
    }),
  ]);
};

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
      this.WSClient.on('error', err => {
        console.error('[WebSocket Log] 服务异常：', err);
      });
      console.log(`[Huasen Log]：websocket 服务端口为${this.port}`);

      // 监听连接
      this.WSClient.on('connection', async (server, req) => {
        let ip = getClientIP(req);
        let query = new URLSearchParams((req.url.split('?')[1] || '').split('#')[0]);
        let token = query.get('token');
        const serverKey = `${ip}-${token}`;
        if (!token) {
          server.close();
          console.error(`[WebSocket Log] ${serverKey} 异常断开连接：缺少 token`);
          return;
        }
        // 认证通过
        JWT.verifyToken(token)
          .then(async ({ data }) => {
            const proof = data;
            const { code } = proof;
            // 判断管理员权限
            if (code < 2) throw new Error('websocket authentication failed');
            // 判断黑名单
            let tag = await withTimeout(isExistObjectFiledRedisItem(POOL_BLACKLIST, ip), WS_REDIS_TIMEOUT, 0);
            if (tag === 1) throw new Error('websocket blacklist');

            // 监听回调参数
            server.on('error', err => {
              console.error(`[WebSocket Log] ${serverKey} 连接异常：`, err);
            });
            // 标记当前连接是否正在处理请求，防止请求堆积
            let processing = false;
            server.on('message', async msg => {
              if (processing) return;
              processing = true;
              try {
                const data = await this.receiveData(msg);
                this.sendMessage(data, server);
              } catch (err) {
                console.error(`[WebSocket Log] ${serverKey} 消息处理异常：`, err);
                this.sendMessage({ system: {}, visitor: getEmptyVisitorInformation() }, server);
              } finally {
                processing = false;
              }
            });
            server.on('close', info => {
              server.close();
              console.log(`[WebSocket Log] ${serverKey || 'unknown'}  正常断开连接：`, info);
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
      try {
        data.system = getSystemInformation();
      } catch (err) {
        console.error('websocket failure to get system information', err);
        data.system = {};
      }
    }
    if (msg.includes('visitor')) {
      try {
        data.visitor = await withTimeout(getVisitorInformation(), WS_VISITOR_TIMEOUT, getEmptyVisitorInformation());
      } catch (err) {
        console.error('websocket failure to get visitor information', err);
        data.visitor = getEmptyVisitorInformation();
      }
    }
    return data;
  }

  // 响应消息到客户端
  sendMessage(data, server) {
    try {
      if (server.readyState !== 1) return;
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
