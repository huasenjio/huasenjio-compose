const fs = require('fs');
const readline = require('readline');
const path = require('path');
const crypto = require('crypto');
const moment = require('moment');
const request = require('request');
const { spawn } = require('child_process')

/**
 * 防抖函数
 * 特定事件段内触发的函数不会被执行
 * @param {Function} function
 * @param {Number} delay
 */
function debounce(func, delay) {
  let timeing = null; // 定义一个定时器变量
  return function (...args) {
    // 存在则清除定时器
    if (timeing) {
      clearTimeout(timeing);
    }
    // 不存在则重新定时
    timeing = setTimeout(() => {
      return func.apply(this, arguments); // 传入参数
    }, delay);
  };
}

/**
 * 对象深拷贝函数
 * @param {object} object
 */
function copyObject(object) {
  let obj = object instanceof Array ? [] : {}; // 判断是数组或者对象进行声明变量
  // 解构获得键值对
  for (const [k, v] of Object.entries(object)) {
    obj[k] = typeof v == 'object' ? copyObject(v) : v; // 如果当前属性是引用类型则递归调用，基础数据类型则直接赋值。
  }
  return obj; // 返还对象
}

/**
 * md5签名
 * @param {String} text 签名内容
 * @returns String
 */
function stringToMD5(text) {
  const md5 = crypto.createHash('md5');
  return md5.update(text).digest('hex');
}

/**
 * 创建文件路径
 * @param {String}} pathName 路径名
 */
const createDirSync = pathName => {
  // 判断地址是否存在
  if (fs.existsSync(pathName)) {
    return true;
  } else {
    if (createDirSync(path.dirname(pathName))) {
      fs.mkdirSync(pathName); // 存在地址则创建图片
      return true;
    }
  }
};

/**
 * 写入文件
 * @param {String} path     绝对路径
 * @param {String} content  写入的内容
 */
const writeToFile = (path, content) => {
  return fs.promises.writeFile(path, content); // promise的方式写入文件
};

/**
 * 删除文件夹以及子文件夹的文件
 * @param {String} path 文件夹的绝对路径
 */
function deleteDir(path) {
  let files = [];
  if (fs.existsSync(path)) {
    if (fs.lstatSync(path).isDirectory()) {
      files = fs.readdirSync(path);
      files.forEach((file, index) => {
        let curPath = path + '/' + file;
        if (fs.statSync(curPath).isDirectory()) {
          deleteDir(curPath); //递归删除文件夹
        } else {
          fs.unlinkSync(curPath); //删除文件
        }
      });
      fs.rmdirSync(path);
    } else {
      fs.unlinkSync(path); //删除文件
    }
  } else {
    console.log('文件路径地址不存在');
  }
}

/**
 * 输出读取管道
 * @param {String} inPath   读取的文件路径（绝对路径）
 * @param {String} outpath  文件输出路径（相对于项目根路径的相对路径）
 */
function streamPipe(inPath, outPath) {
  if (!inPath) return;
  if (!outPath) return;
  // 校验输出输出路径
  return new Promise((resolve, reject) => {
    let source = fs.createReadStream(inPath);
    var dest = fs.createWriteStream(path.resolve(process.cwd(), outPath));
    source.pipe(dest);
    source.on('end', function () {
      resolve();
    });
    source.on('error', function (err) {
      reject(err);
    });
  });
}

/**
 * 删除文件
 * @param {String} path 文件的绝对路径
 */
function unlinkFile(path) {
  if (!path) return;
  return new Promise(async (resolve, reject) => {
    try {
      let result = await fs.promises.unlink(path);
      resolve('删除成功');
    } catch (err) {
      if (err.errno == -2) {
        reject('文件不存在');
      } else {
        reject('删除失败');
      }
    }
  });
}

/**
 * 逐行读取
 * @param {String} filePath 绝对地址
 */
function readFileByLine(filePath, callback) {
  return new Promise((resolve, reject) => {
    let lines = [];
    const rl = readline.createInterface({
      input: fs.createReadStream(filePath),
    });
    rl.on('line', line => {
      lines.push(line);
    });
    rl.on('close', () => {
      resolve(lines);
    });
    rl.on('error', err => {
      reject(err);
    });
  });
}

/**
 * 读取输出文件夹下所有的文件名称（带路径）
 * @param   {String} filePath   绝对路径
 * @returns {Array}  文件名数组
 */
function readDirectory(filePath) {
  if (!fs.existsSync(filePath)) return [];
  let files = [];
  let names = fs.readdirSync(filePath);
  names.forEach(function (name) {
    let fileDir = path.join(filePath, name);
    let fileStatus = fs.statSync(fileDir);
    if (fileStatus.isFile()) {
      files.push(fileDir);
    } else if (fileStatus.isDirectory()) {
      files = files.concat(readDirectory(fileDir));
    }
  });
  return files;
}

/**
 * 指定长度获得不重复的uid
 * @param {Number} len    长度
 * @param {Number} radix  基数位数
 * @returns
 */
function getUid(len, radix) {
  var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
  var uuid = [],
    i;
  radix = radix || chars.length;
  if (len) {
    // Compact form
    for (i = 0; i < len; i++) uuid[i] = chars[0 | (Math.random() * radix)];
  } else {
    // rfc4122, version 4 form
    var r;
    // rfc4122 requires these characters
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
    uuid[14] = '4';
    // Fill in random data.  At i==19 set the high bits of clock sequence as
    // per rfc4122, sec. 4.1.5
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | (Math.random() * 16);
        uuid[i] = chars[i == 19 ? (r & 0x3) | 0x8 : r];
      }
    }
  }
  return uuid.join('');
}

/**
 * 计算同比增长
 * @param {Number} nV - 新值
 * @param {Number} oV - 旧值
 * @returns
 */
function handleRate(nV, oV) {
  if (oV === 0) return '--%';
  let rate = (Math.abs((nV - oV) / oV) * 100).toFixed(2);
  let flag = nV < oV ? '-' : '+';
  return flag + rate + '%';
}

/**
 * 下载图片并转换为base64
 * @param {String} imageUrl - 图片地址
 * @returns 
 */
async function downloadAndConvertToBase64(imageUrl) {
  return new Promise((resolve, reject) => {
    request.get({ url: imageUrl, timeout: 6000, encoding: null }, (error, response, body) => {
      if (error) {
        reject(error);
      } else if (response.statusCode !== 200) {
        reject(new Error(`Unexpected status code ${response.statusCode}`));
      } else {
        let type = response.headers['content-type'];
        let prefix = 'data:' + type + ';base64,';
        let base64 = new Buffer.from(response.body, 'binary').toString('base64');
        resolve(prefix + base64);
      }
    });
  });
}

/**
 * 字节转换大小
 * @param {Number} bytes - 字节数
 * @returns 
 */
function bytesToSize(bytes) {
  if (bytes === 0) return '0 B';
  let k = 1024;
  let sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  let i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
}

/**
 * 获取当前时间
 * @param {Boolean} simple 
 * @returns 
 */
function getTime(simple) {
  return simple ? moment().format('YYYYMMDDHHmmss') : moment().format('YYYY-MM-DD HH:mm:ss');
}

/**
 * 获取客户端IP
 * @param {Object} req - 请求对象
 * @returns 
 */
function getClientIP(req) {
  // 按优先级获取客户端IP
  return (
    req.headers['x-forwarded-for']?.split(',')[0] || // 获取代理前的真实IP
    req.headers['x-real-ip'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.ip
  );
}


/**
 * 执行命令
 * @param {String} command - 命令
 * @param {Array} args - 参数
 * @param {Object} options - 选项
 * @returns
 */
function commandSpawn(command, args, options) {
  return new Promise((resolve, reject) => {
    // 开启子终端执行命令，例如npm install为spawn('npm', ['install'], {cwd: '工作路径'})
    const childProcess = spawn(command, args, options)
    childProcess.stdout.pipe(process.stdout)
    childProcess.stdout.pipe(process.stderr)
    childProcess.on('close', () => {
      path.resolve();
    })
  })
}

module.exports = {
  debounce,
  copyObject,
  deleteDir,
  stringToMD5,
  streamPipe,
  unlinkFile,
  readFileByLine,
  readDirectory,
  createDirSync,
  getUid,
  writeToFile,
  handleRate,
  downloadAndConvertToBase64,
  bytesToSize,
  getTime,
  getClientIP,
  commandSpawn
};
