/*
 * @Autor: huasenjio
 * @Date: 2021-10-04 11:39:03
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-04-15 12:43:42
 * @Description: 后端服务配置文件
 */

const path = require('path');

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

// QQ邮箱服务配置
const QQ_MAIL = {
  host: 'smtp.qq.com', // QQ邮箱厂商
  port: 465,
  secure: true,
  auth: {
    user: 'QQ邮箱', //  发送方邮箱地址
    pass: 'QQ邮箱 mtp', //  自己申请的mtp的通行码
  },
};

// 网易邮箱服务配置
const WY_MAIL = {
  host: 'smtp.163.com',
  port: 465,
  secure: true,
  auth: {
    user: '163邮箱',
    pass: '163邮箱 mtp',
  },
};

// 令牌密钥配置
const JWT = {
  screat: 'Lyh9gVf9dQstDgtvD6fuhy9ygYgycrWs', // jwt加密密钥
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
  acceptTypes: ['image/jpg', 'image/jpeg', 'image/png', 'svg+xml', 'application/pdf'], // 文件默认允许的类型
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

// 对称密钥
const SECRET_AES = ['dj38Ca8F8hag23nD', 'k4h9HdcXmEr83nsF'];

// 非对称公钥
const SECRET_RSA_PUBLIC = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDeGJGWCwekus6kxqCafRWjX23R
ICAHMZN/6oEH4bqwut/frOUXbcVCOzShnye81Ow2p0zA9GR6NApmvs0QgT2FK7j0
9ArQATZ7tVUFE//HnyJj7Dm3D1u60itvizJiiekS9Ob23rERswr//Vc6CnsLqV8U
1dzCUMS2aNTAI8l7rwIDAQAB
-----END PUBLIC KEY-----
`;

// 非对称私钥
const SECRET_RSA_PRIVATE = `-----BEGIN PRIVATE KEY-----
MIICeAIBADANBgkqhkiG9w0BAQEFAASCAmIwggJeAgEAAoGBAN4YkZYLB6S6zqTG
oJp9FaNfbdEgIAcxk3/qgQfhurC639+s5RdtxUI7NKGfJ7zU7DanTMD0ZHo0Cma+
zRCBPYUruPT0CtABNnu1VQUT/8efImPsObcPW7rSK2+LMmKJ6RL05vbesRGzCv/9
VzoKewupXxTV3MJQxLZo1MAjyXuvAgMBAAECgYEAzcuoQ4cu6vZqeobO1LgpL7xC
bvA8nU3T5kiujVYd/pr6zTFRCpednBRuXYCzeqc1xiLZ3UXYQOAt7yzHqY6IKD79
5Hola/6Tven9+h9aZsWlCyRLMBFq0IjT/Qq6kbucxwtZq71CZuvDNLBeYeMKTJu6
f7zveT40H6Te5AttxlECQQDxuZXdyL3F95+weiW4vMgYPmLsAitALYE3TQ071/fE
gPcoP3xd8ktkEu6ivMi8eTJuMOtKYr7Wrp6GMSfnoi3JAkEA6zY7Km8vk33WmDlU
p2FgCdPb7of8iBS5okTgzu1MgbPCPjGfemZwwbMt0K1pYtTZQIvbIPxaxk+ertcB
DeE5twJBAOzZUl4g7snGSyMpXEK6Pzl6D4V+zpAwxjbAeeIUSEKztvkp05td6L8i
yc6NOgdqnZ5YsoONY76JFO0ZxybwwvkCQQCRhsgshQZGlwECxdXeiZzF99KHTpOs
DkacY0lEPgWr6fAwUrt9G4yAC8A48FHX2CFikiVNz1TKhdCEFHqOf98ZAkArj/Ju
+BZM9Xr6RWEAinsao6A8IUZDwr4I71lAgIZotG+8ntQCwQWoMpDX5ldD74Ma6XO/
VJPOwx0vHx4BTRBM
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

  QQ_MAIL,
  WY_MAIL,

  PORT_SERVER,

  POOL_BLACKLIST,
  POOL_ACCESS,
  POOL_MAIL,
  POOL_TOKEN,

  SECRET_AES,
  SECRET_RSA_PUBLIC,
  SECRET_RSA_PRIVATE,
};
