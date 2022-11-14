const fs = require('fs');
const readline = require('readline');
const path = require('path');
const crypto = require('crypto');
const Validator = require('../utils/strategy.js');

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
 * 交换数组元素位置
 * @param {Array}  array   操作数组
 * @param {Number} before 移动前的下标
 * @param {Number} to     移动到的下标
 */
function exchangeArrayItem(array, before, to) {
  // 保存原位置的对象
  let oldItem = array[to];
  // 开始交换位置
  array.splice(to, 1, array[before]);
  array.splice(before, 1, oldItem);
}

/**
 * md5简单加密
 * @param {String} text 脱敏的字符串
 * @returns String
 */
function stringToMD5(text) {
  const md5 = crypto.createHash('md5');
  return md5.update(text).digest('hex');
}

/**
 * 配合策略模式校验多项数据合法性
 * @param {Array} arr 需要校验项数组 [{value: value, rules: []}]
 * @returns String
 */
function checkParamsByRules(arr) {
  for (let item of arr) {
    let v = new Validator();
    v.add(item.value, item.rules);
    let errText = v.start(); // 返回最新
    if (errText) {
      return errText;
    }
  }
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
 * 数组扁平化
 * @param {Array} arr 传入被扁平化的数组
 * @returns Array
 */
function flatten(arr) {
  let res = [];
  arr.map(item => {
    if (item.children && item.children.length != 0) {
      // 有子路由
      res.push(item);
      res = res.concat(flatten(item.children));
    } else {
      res.push(item);
    }
  });
  return res;
}

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

function handleRate(nV, oV) {
  if (nV === 0 && oV === 0) return '+0%';
  if (nV === 0 && oV !== 0) return '-100%';
  if (nV !== 0 && oV === 0) return '+100%';

  let rate = Math.abs((nV - oV) / nV).toFixed(2);
  let flag = nV < oV ? '-' : '+';
  return flag + rate + '%';
}

module.exports = {
  debounce,
  copyObject,
  exchangeArrayItem,
  deleteDir,
  stringToMD5,
  checkParamsByRules,
  streamPipe,
  flatten,
  unlinkFile,
  readFileByLine,
  readDirectory,
  createDirSync,
  getUid,
  writeToFile,
  handleRate,
};
