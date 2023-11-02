/*
 * @Autor: huasenjio
 * @Date: 2021-10-04 11:39:03
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-02-04 14:29:05
 * @Description: 后端服务配置文件
 */

const path = require('path');
const _ = require('lodash');

// 解析动态配置
let setting = {};
try {
  setting = require('./setting.json');
} catch (err) {
  console.error('配置解析失败', err);
}

// 获取命令行传递的参数集合
let args = process.argv.find(row => {
  return /^MODE=(dev|pro)$/.test(row);
});

// 运行环境常量（dev ｜ pro）
const MODE = args ? args.split('=')[1] : 'dev';

// 服务启动端口
const PORT_SERVER = 3000;

// 黑名单资源池
const POOL_BLACKLIST = 'POOL_BLACKLIST';
// 用户信息池
const POOL_ACCESS = 'POOL_ACCESS';
// 邮箱验证码池
const POOL_MAIL = 'POOL_MAIL';
// 令牌池
const POOL_TOKEN = 'POOL_TOKEN';

// 数据库连接配置
const DB = {
  name: 'huasenjio', // 角色名
  password: 'Mongo12345*', // 角色密码
  ip: MODE == 'dev' ? '127.0.0.1' : 'mongo', // 数据库地址
  port: 37017, // 端口
  dbName: 'huasen', // 数据库名
};

// websocket配置
const WS = {
  port: 8181,
  interval: 10000,
};

// redis连接配置
const REDIS = {
  port: 7379, // 端口号
  host: MODE == 'dev' ? '127.0.0.1' : 'redis', // redis地址
  password: 'Redis12345*', // redis密码
};

// QQ邮箱服务配置示例
const QQ_MAIL = {
  host: 'smtp.qq.com', // QQ邮箱厂商
  port: 465,
  secure: true,
  auth: {
    user: 'QQ邮箱', //  发送方邮箱地址
    pass: 'QQ邮箱 mtp', //  自己申请的mtp的通行码
  },
};

// 实际邮箱配置
const mail = _.get(setting, 'site.mail') || {};
let { host, port, auth } = { ...mail };
const MAIL = {
  host: host || QQ_MAIL.host,
  port: port || QQ_MAIL.port,
  secure: true,
  auth: {
    user: _.get(auth, 'user') ? _.get(auth, 'user') : QQ_MAIL.auth.user,
    pass: _.get(auth, 'pass') ? _.get(auth, 'pass') : QQ_MAIL.auth.pass,
  },
};

// 站点配置
const SITE = {
  redirectURL: _.get(setting, 'site.redirectURL') || 'http://huasen.cc/',
};

// 网易邮箱服务配置示例
const WY_MAIL = {
  host: 'smtp.163.com',
  port: 465,
  secure: true,
  auth: {
    user: '163邮箱',
    pass: '163邮箱 mtp',
  },
};

/**
 * 令牌密钥配置
 * 密钥格式：32位数子/字母
 */
const JWT = {
  screat: _.get(setting, 'site.jwt') || 'Lyh9gVf9dQstDgtvD6fuhy9ygYgycrWs', // jwt加密密钥
  expiresIn: 604800, // 7天失效时间
};

// 会话
const SESSION = {
  secret: '4008208820',
  cookie: { maxAge: 60 * 60 * 1000 * 24 * 7 },
  resave: true,
  saveUninitialized: false,
};

// 文件上传配置
const STORE = {
  acceptTypes: ['image/jpg', 'image/jpeg', 'image/png', 'image/gif', 'svg+xml', 'application/pdf', 'application/json'], // 文件默认允许的类型
  fileSize: 1024 * 1024 * 10, // 限制10m大小
  target: 'file', // 获取前端上传文件的key值
  encoding: 'utf-8', // 传输的编码格式
  maxFieldsSize: 1024 * 1024 * 2, // 传输类型为text的字段的大小默认不超过2m
  maxFields: 10, // 默认支持1000个字段的解析
  maxFilesSize: 1024 * 1024 * 10, // 传输类型为file文件的大小不超过5m
  autoFiles: true, //控制是否可以上传文件
  uploadPath: path.resolve(__dirname, '../huasen-store/default'), // 默认上传文件路径
};

const TASK = {
  // 任务执行的时间间隔
  interval: 10000,
};

// 返回状态码
const STATUS = {
  SUCCESS: 200, // 正常返回
  ERROR: 400, // 服务器内部错误
  FORBIDDEN: 403, // 权限不足
  AUTH: 401, // 无法认证，重新登录
};

// 默认管理员
const ADMIN = {
  id: 'admin@qq.com',
  password: '12345',
};

/**
 * 对称密钥
 * 密钥格式：16位数子/字母
 * 特别注意：需要部署之前修改，否则数据无法解析
 */
const SECRET_AES = ['dj38Ca8F8hag23nD', 'k4h9HdcXmEr83nsF'];

/**
 * 非对称密钥要求：
 * 密钥位数：2048位（bit）
 * 密钥格式：PKCS#8
 * 输出格式：PEM/Base64
 * 推荐在线生成站点：https://try8.cn/tool/cipher/rsa
 */

// 非对称公钥
const SECRET_RSA_PUBLIC = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAykOjPXYErze4pX/r6au/
cHOpnWlyP5AO1qXblDbQ7ZbTO2QG4MLVqz938mCstV+urDfySTHBVbeA0iwg7iye
WULR7+IHHdE7QQRCNpV3t+EPq4xbKvGv9m7U6E6vh+z4SRJDuX0rWzxhbdYsIQZd
VDs8eqfbLVMjS1+BEB/S8tFsgjWpIMfMQYF1Ale3GQjy1kLturpeAVQCnAA5dXpM
KU4I4sFpDPL58DBHziPc0UkyJCt5Y9xhEvqSaTInqzFoHKnjx1xw6bM7brsZveRT
+x8PIqepeHpI2cxjRcLKl3v/hO1qOk2a4OrY+K3z36o7KS4DZQrN/7YBWx2p3ThL
pQIDAQAB
-----END PUBLIC KEY-----
`;

// 非对称私钥
const SECRET_RSA_PRIVATE = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDKQ6M9dgSvN7il
f+vpq79wc6mdaXI/kA7WpduUNtDtltM7ZAbgwtWrP3fyYKy1X66sN/JJMcFVt4DS
LCDuLJ5ZQtHv4gcd0TtBBEI2lXe34Q+rjFsq8a/2btToTq+H7PhJEkO5fStbPGFt
1iwhBl1UOzx6p9stUyNLX4EQH9Ly0WyCNakgx8xBgXUCV7cZCPLWQu26ul4BVAKc
ADl1ekwpTgjiwWkM8vnwMEfOI9zRSTIkK3lj3GES+pJpMierMWgcqePHXHDpsztu
uxm95FP7Hw8ip6l4ekjZzGNFwsqXe/+E7Wo6TZrg6tj4rfPfqjspLgNlCs3/tgFb
HandOEulAgMBAAECggEAVkkgfHm6ad1FgiTeSWMhWiGdfC+ds4wLKHq8/6+a1aCA
IFf9ryiu6k07KEUhqIZXB9UeISd+qMiNxhtZOQID02R0Fve/vXKi6ouci5ib5++1
NaO8yMcuH90MKsZWj5ACI3oNNjY1pshNcAPr83K5odNba5/sGpva9K6banuJDFiU
pwWn1+MsqiZ74tLRlPKteyvGw0b6OWjxMeIr7/G1O30wd6MiAKObKK/ODO9CQlC2
wUAIbFqewudv26ZzkMDjpVsI42p0/xRGBQDt4vGGfKiBj05fofPl3kn7kLmY+edn
/yfvONhdHjnQVzITa9DSU1IXY8lVFHEGxuWM+V3OyQKBgQDu3YFTlsiHNTcTgs/f
LgLaMtVnjFtqu01j6F6HL9mO5ytFCE9GtaEnbNVy1z5BoAm3JgVcd63sArKFiuUn
GuaVglCKbjhgFgwnGPI11QAvPAOB2Qu19XrTwVQa4C0lJ6JrGuZe+1gLbbF+7bLV
+LMUOEU9o6YFWcMQ7fRrcLguAwKBgQDYxf624LgU0ThS301Y78O5r5g2ePZ/F1W6
M1XTlSWgllYBeDezOAH12tisYCrbEpniATfhN9Lc4qlXWz+yGVNfC2PbyfTCTdhL
kwPsf/GXM8WWe4Nid+LV5bmy5loq8dCpgXzB8w4LoFuE2ZFxr57q+32Pg04taNGP
txajinQjNwKBgAwqiA3D3k7UrQt3XDMX2tlWQXxWr8lN5PEzwqzMCR64M4H+nFsT
oTOq3WxN/kPFbPlBHIDLL7aXpJQcsPM+8YOn8YY7eu+Z7+CF6sBHKw0810jjzy7j
Y/ApJql/xYzg6ereoeEwmBls6t92J+eyFRzwiMZM8YXQPpk8JXjbcuYVAoGAZrWJ
doULM3HeSgXb1CPmjPiSGl0+DgG0cMEaDWJBrdENdyzK13PWGfNTbnkyVRJ/LwJ8
w417r4UFz4pAp9YwFnyDGAScn+PadBR4a3pDseyp1h83pVRAejCayBU069wfjfD4
d7z+DqwwMMYVj9QybAw09ea1B/b+NCX/6AUV+gkCgYEAqlrfNpXSaFbxCtDy4oA3
kHRrmwkjlGj07cSBCCInw5yL1qnSPaLVaK+l4fN68+Ac0ZvH9XFYiXYLWV8vGLUm
DyeS4WrWYM2tCoqSp/JnwReRiJPYx3lSfaB1qERyTRxKyFoMgcdybyTvIDTXiOqr
sHAMEhW3k0BqdsBQ9KSbExU=
-----END PRIVATE KEY-----
`;

module.exports = {
  MODE,
  DB,
  REDIS,
  WS,
  JWT,
  TASK,
  SESSION,
  STORE,
  STATUS,
  ADMIN,

  MAIL,
  QQ_MAIL,
  WY_MAIL,

  SITE,

  PORT_SERVER,

  POOL_BLACKLIST,
  POOL_ACCESS,
  POOL_MAIL,
  POOL_TOKEN,

  SECRET_AES,
  SECRET_RSA_PUBLIC,
  SECRET_RSA_PRIVATE,
};
