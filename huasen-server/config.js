/*
 * @Autor: huasenjio
 * @Date: 2021-10-04 11:39:03
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-19 11:05:35
 * @Description: 后端服务配置文件
 */

const path = require('path');
const _ = require('lodash');

// 加载 .env 文件（如果存在）
try {
  require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
  console.log('[Huasen Log]：已加载 .env 环境变量');
} catch (err) {
  console.log('[Huasen Log]：未找到 dotenv 模块或 .env 文件，使用默认配置。');
}

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
console.log('[Huasen Log]：运行模式 MODE =', MODE);

// 后台服务启动端口
const PORT_SERVER = 3000;
// 授权码校验激活地址
const LICENSE_VERIFY_URL = MODE === 'dev' ? `http://localhost:${PORT_SERVER}/license/verify` : 'https://www.huasenjio.top/api/license/verify';
const LICENSE_SYNC_URL = MODE === 'dev' ? `http://localhost:${PORT_SERVER}/license/center/sync` : 'https://www.huasenjio.top/api/license/center/sync';
const LICENSE_RISK_REPORT_URL = MODE === 'dev' ? `http://localhost:${PORT_SERVER}/license/risk/report` : 'https://www.huasenjio.top/api/license/risk/report';

// 黑名单资源池
const POOL_BLACKLIST = 'POOL_BLACKLIST';
// 用户信息池
const POOL_ACCESS = 'POOL_ACCESS';
// 邮箱验证码池
const POOL_MAIL = 'POOL_MAIL';
// 令牌池
const POOL_TOKEN = 'POOL_TOKEN';
// 图片验证码池
const POOL_CAPTCHA = 'POOL_CAPTCHA';

// 数据库连接配置，默认开发环境直接外部访问，生产环境连接docker的mongo容器
const dbDirConnection = MODE === 'dev';
const DB = {
  name: process.env.MONGO_APP_USERNAME || 'huasenjio', // 角色名
  password: process.env.MONGO_APP_PASSWORD || 'Mongo12345*', // 角色密码
  ip: dbDirConnection ? '127.0.0.1' : 'mongo', // 数据库地址
  port: 37017, // 端口
  dbName: 'huasen', // 数据库名称
  dbDirConnection,
};

// redis连接配置，默认开发环境直接外部访问，生产环境连接docker的redis容器
const redisDirConnection = MODE === 'dev';
const REDIS = {
  port: 7379, // 端口号
  host: redisDirConnection ? '127.0.0.1' : 'redis', // redis地址
  password: process.env.REDIS_PASSWORD || 'Redis12345*', // redis密码
  redisDirConnection,
};

// websocket配置
const WS = {
  port: 8181,
  interval: 15000,
};

// QQ邮箱服务配置示例
const QQ_MAIL = {
  host: 'smtp.qq.com', // QQ邮箱厂商
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_QQ_USER || '', //  QQ邮箱地址
    pass: process.env.SMTP_QQ_MTP || '', //  QQ邮箱地址的mtp通行码
  },
};

// 网易邮箱服务配置示例
const WY_MAIL = {
  host: 'smtp.163.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_WY_USER || '',
    pass: process.env.SMTP_WY_MTP || '',
  },
};

// 必须配置项目的邮箱服务，否则无法发送验证码
const MAIL = {
  host: _.get(setting, 'mail.host') || QQ_MAIL.host,
  port: _.get(setting, 'mail.port') || QQ_MAIL.port,
  secure: true,
  auth: {
    user: _.get(setting, 'mail.user') || QQ_MAIL.auth.user,
    pass: _.get(setting, 'mail.mtp') || QQ_MAIL.auth.pass,
  },
};

// 重定向站点，当用户访问不正确的链接时，将会重定向到以下配置的站点
const SITE = {
  redirectURL: _.get(setting, 'site.redirectUrl') || 'https://huasenjio.top/',
};

/**
 * 令牌密钥配置
 * 密钥格式：32位数子/字母
 */
const JWT = {
  screat: _.get(setting, 'site.jwt') || 'abcdefghyjklmnobqrstuvwhyz123456', // jwt加密密钥
  expiresIn: _.get(setting, 'site.jwtLiveTime') || 604800, // 7天失效时间
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
  // 文件默认允许的类型，仅支持MIME
  acceptTypes: {
    '.jpg': 'image/jpg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.bmp': 'image/bmp',
    '.ico': 'image/vnd.microsoft.icon',

    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',

    '.mp3': 'audio/mpeg',
    '.webm': 'audio/webm',
    '.aac': 'audio/aac',
    '.mp4': 'video/mp4',
    '.mpeg': 'video/mpeg',

    '.csv': 'text/csv',
    '.txt': 'text/plain',
    '.md': 'text/markdown',

    '.json': 'application/json',

    '.rar': 'application/vnd.rar',
    '.tar': 'application/x-tar',
    '.zip': 'application/zip',
    '.7z': 'application/x-7z-compressed',
    '.bz': 'application/x-bzip',

    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',

    '.sh': 'application/x-sh',
    '.bin': 'application/octet-stream',
  },

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

/**
 * 对称密钥
 * 密钥格式：16位数子/字母
 * 特别注意：需要部署之前修改，否则数据无法解析
 */
const SECRET_AES = [process.env.AES_SECRET_KEY || 'dj38Ca8F8hag23nD', process.env.AES_SECRET_IV || 'k4h9HdcXmEr83nsF'];

const LICENSE_SIGN_PUBLIC_KEY = process.env.LICENSE_SIGN_PUBLIC_KEY || '';
const LICENSE_SIGN_PRIVATE_KEY = process.env.LICENSE_SIGN_PRIVATE_KEY || '';
const LICENSE_LEASE_DAYS = Number(process.env.LICENSE_LEASE_DAYS || 7);

/**
 * 非对称密钥要求：
 * 密钥位数：2048位（bit）
 * 密钥格式：PKCS#8
 * 输出格式：PEM/Base64
 * 推荐在线生成站点：https://try8.cn/tool/cipher/rsa
 */

// 非对称公钥
const SECRET_RSA_PUBLIC = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsNZP8rvM9X/kjFQhiNwY
Yla6u4KSOwe+XEYQJFD+w3H6PdcfZNtRX0HphJ8jLLhsT5zreI+9jSjhk9nsYuj+
vAvssRq5NJ/C0pTAY0+3Q87azWh60rvB/ZuHkz9+utINxrvFYH8ROkX84QWhegpB
oTc4P/DhgbdkWBVIVx+woXewAlUs+rPtSva9H+u7gUIcjkeqAgC8XftuiIcwrjfe
Xh/1X0YCCZzaeF4HsHflo7yyhg61jCh4U+geWCHpmhgenKCp3v2cdX/4cE6u9GaK
EnuHkODhibiT6bJSzNDvUyLMv7bElmR16X25QaruMdjmDIKojEVwdbyp+TjrHRoj
jwIDAQAB
-----END PUBLIC KEY-----
`;

// 非对称私钥
const SECRET_RSA_PRIVATE = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCw1k/yu8z1f+SM
VCGI3BhiVrq7gpI7B75cRhAkUP7Dcfo91x9k21FfQemEnyMsuGxPnOt4j72NKOGT
2exi6P68C+yxGrk0n8LSlMBjT7dDztrNaHrSu8H9m4eTP3660g3Gu8VgfxE6Rfzh
BaF6CkGhNzg/8OGBt2RYFUhXH7Chd7ACVSz6s+1K9r0f67uBQhyOR6oCALxd+26I
hzCuN95eH/VfRgIJnNp4Xgewd+WjvLKGDrWMKHhT6B5YIemaGB6coKne/Zx1f/hw
Tq70ZooSe4eQ4OGJuJPpslLM0O9TIsy/tsSWZHXpfblBqu4x2OYMgqiMRXB1vKn5
OOsdGiOPAgMBAAECggEAIN4ki/Q1+ydjPmXgucRWz+hY2sNBFLGywwnOtEFNqNwF
a/sQ/bj53d+tXJYLfqNklkOPTKBC1frUOpvVoOi3eBIrUxupcsuC9YrqW0sUwAix
iF4z/fkh7FY9E7RIhMbIArkhzXawqAkcIGLgiYNggWt3DANklqyUfP6vrGnadZgv
Scx0xDio568oUFU3X2EHt3kUacU/HbhyMe63+O+kEpMYazvUFQwKpslAg4uSwxNu
dk97lOAF/8qXpbNJXwxfhKSV7Glb5qU8WWx6h2VMOjlm6zbvj33/peRfU8XfO+Vf
78kIHbiNdZ15xZbvqNLUk3rdWbRg8J2WQ1u/R5iGWQKBgQDUzKDRZCcHhpNyy2AD
sh2CKp4qRiiv5DK84q3C7P3EJ3ab9a5gj4LYNJ/GSZqAuSa+U08p7QcHZ2QNHARo
QsJlpU34qO2P3949NrC8pVasduzuw3guSPAGDit5AsRu4st5ZNhkwj2PZyAONhYX
uLN0GSRag8SerucKGYfn/2MUywKBgQDUvLKkwLM/64TaffU0h1Jah/YrQFErE4Gz
2LtQdxxHsDdresdKB9VKsMco/C8eys4TxSuSVt0eoLfyi3lt33vrFviwOTWOh0ZU
1zN6j3WtPPMCiysl6MFXs2KXy36pjTnNGWdG3dORHch3DKjMTm5HgxxhUHKkEPgS
pSkmL2TXzQKBgH2F3u7kxuj3hw5VzOMhM6rOfNGu5N0sHImypJCwvtfv91TzzNKE
lMf38q9CR3LaxHHMLowqltTVNf1No4PkrUrMAXxGGSufADbXhdUhKkk9NXF5t/CF
caAAx7/v0/McsK2AwOxeb3WhfRUk7k870g8PrZP+2gJIZVxdxv8gdE+VAoGBAIJ7
XsMoookRJwJwgWZ/naaDgBzVLTPTmhk6VOGsvP7HeaaFvxiMJ2nRdcaQr0IeuDlu
FSSD/ModX9X3cDpQ+gueolhMLqpGFIBTInMI7O+d05t6yrNMyNHG6DEckoriYVKI
Q003H94BO4SxkhMGBCP+qfiSRE6XTeD5xnxyU1L9AoGAaON1foC3Msz9Ng64BRKD
Kufv/1TVjL1/iqizBEh/EzLBxbY4aaXbwHUImslF5AaIY8nbVxPEHbRiIcfX7Rmf
9NicjdycbvwYlI6qqk0mKVr/SJrH9b+EzANOdXP358o9T1ADHuxBwRVUZZvHVrGU
79WOXYmDUgXb8o6IGzODl10=
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

  MAIL,
  QQ_MAIL,
  WY_MAIL,

  SITE,

  PORT_SERVER,
  LICENSE_VERIFY_URL,
  LICENSE_SYNC_URL,
  LICENSE_RISK_REPORT_URL,

  POOL_BLACKLIST,
  POOL_ACCESS,
  POOL_MAIL,
  POOL_TOKEN,
  POOL_CAPTCHA,

  SECRET_AES,
  SECRET_RSA_PUBLIC,
  SECRET_RSA_PRIVATE,
  LICENSE_SIGN_PUBLIC_KEY,
  LICENSE_SIGN_PRIVATE_KEY,
  LICENSE_LEASE_DAYS,
};
