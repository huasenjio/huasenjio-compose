/*
 * @Autor: huasenjio
 * @Date: 2022-10-17 23:48:19
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-17 23:49:58
 * @Description: 工具库
 */
import dayjs from "dayjs";

/**
 * setTimeout实现定时效果
 * @param {Function} fn - 回调函数
 * @param {Number} delay - 延迟时间
 * @param {Boolean} immediate - 是否立即执行
 */
export function timeout2Interval(fn, delay, immediate) {
  // 是否立即执行
  if (immediate) fn();
  // 延时器对象
  let timer = null;
  // 定时器回调函数
  function inside() {
    clearTimeout(timer);
    fn();
    timer = setTimeout(inside, delay);
  }
  timer = setTimeout(inside, delay);
  return {
    clear() {
      clearTimeout(timer);
    },
  };
}

/**
 * 格式化日期
 * @param {Date} date - 日期
 * @param {String} format - 格式化字符串，默认：YYYY-MM-DD HH:mm:ss
 * @returns {String} 格式化后的日期
 */
export function formatDate(date, format = "YYYY-MM-DD HH:mm:ss") {
  return dayjs(date).format(format);
}

/**
 * 指定长度获得不重复的uid
 * @param {Number} len - 长度
 * @param {Number} radix - 基数位数
 * @returns
 */
export function getUid(len = 16, radix = 8) {
  let chars =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");
  let uuid = [];
  let i;
  radix = radix || chars.length;
  if (len) {
    // Compact form
    for (i = 0; i < len; i++) uuid[i] = chars[0 | (Math.random() * radix)];
  } else {
    // rfc4122, version 4 form
    var r;
    // rfc4122 requires these characters
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = "-";
    uuid[14] = "4";
    // Fill in random data.  At i==19 set the high bits of clock sequence as
    // per rfc4122, sec. 4.1.5
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | (Math.random() * 16);
        uuid[i] = chars[i == 19 ? (r & 0x3) | 0x8 : r];
      }
    }
  }
  return uuid.join("");
}

/**
 * 解析JSON字符串
 * @param {String} JSONString - JSON字符串
 * @param {String} prototypeType - 原型类型，不满足时返回默认值，例如：Object, Array, String, Number, Boolean, Date, RegExp, Function, Symbol, BigInt, Undefined, Null
 * @param {*} defValue - 默认值
 */
export function parseJSON(JSONString, prototypeType, defValue) {
  try {
    let obj = JSON.parse(JSONString);
    if (
      prototypeType &&
      Object.prototype.toString.call(obj) !== `[object ${prototypeType}]`
    ) {
      return defValue;
    }
    return obj;
  } catch (err) {
    console.log(err);
    return defValue;
  }
}

/**
 * 判断浏览器版本是否为IE
 * @returns {Number} 浏览器版本号，即：-1为非IE浏览器、edge为Edge浏览器、11为IE11浏览器、其他为IE浏览器
 */
export function judgeIE() {
  let userAgent = navigator.userAgent; // 浏览器的userAgent字符串
  let isIE =
    userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1; // 判断是否IE<11浏览器
  let isEdge = userAgent.indexOf("Edge") > -1 && !isIE; // 判断是否IE的Edge浏览器
  let isIE11 =
    userAgent.indexOf("Trident") > -1 && userAgent.indexOf("rv:11.0") > -1; // 判断是否IE11浏览器
  if (isIE) {
    let reIE = new RegExp("MSIE (\\d+\\.\\d+);");
    reIE.test(userAgent);
    let fIEVersion = parseFloat(RegExp["$1"]);
    if (fIEVersion == 7) {
      return 7;
    } else if (fIEVersion == 8) {
      return 8;
    } else if (fIEVersion == 9) {
      return 9;
    } else if (fIEVersion == 10) {
      return 10;
    } else {
      return 6; // IE版本<= 7
    }
  } else if (isEdge) {
    return "edge"; // edge
  } else if (isIE11) {
    return 11; // IE11
  } else {
    return -1; // 不是ie浏览器
  }
}

/**
 * 拷贝文本到剪切板
 * @param {String} content - 拷贝的内容
 * @param {Function} callback - 回调函数
 * @param {Boolean} line - 是否需要换行符
 */
export function copyTextToClip(content, callback, line = false) {
  var copyEl = document.createElement(line ? "textarea" : "input");
  copyEl.setAttribute("value", content);
  document.body.appendChild(copyEl);
  copyEl.select();
  document.execCommand("copy");
  document.body.removeChild(copyEl);
  if (typeof callback === "function") {
    callback();
  }
}

/**
 * 格式化尺寸
 * @param {String|Number} size - 处理传入尺寸数据，例如：'100px'、'100'、100 = '100px'；'100%' = '100%'
 * @param {String} defaultSize - 默认尺寸
 */
export function formatSize(size, defaultSize = "fit-content") {
  if (typeof size === "string") {
    return /^\d+(\.\d+)?(%|px)$/.test(size) ? size : `${size}px`;
  } else if (typeof size === "number") {
    return `${size}px`;
  } else {
    return defaultSize;
  }
}

/**
 * 将传入的file对象、blob对象转换成base64字符串
 * @param {Blob|File} img - blob对象、file对象
 * @param {Function} callback - base64字符串参数的回调函数
 */
export function getBase64(file, callback) {
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    callback(reader.result); // 监听读取返回的值
  });
  reader.readAsDataURL(file);
}

/**
 * 请求参数拼接在url链接中
 * @param {String} url - 地址
 * @param {Object} data - 参数对象
 * @returns 拼接后的URL字符串
 */
export function handleURL(url = "", data = {}) {
  // 创建URL对象
  const urlObj = new URL(url);
  // 如果data不为空，则添加查询参数
  if (Object.keys(data).length > 0) {
    // 使用URLSearchParams处理查询参数
    const searchParams = new URLSearchParams(urlObj.search);
    for (const [key, value] of Object.entries(data)) {
      searchParams.set(key, value);
    }
    // 更新URL对象的查询字符串
    urlObj.search = searchParams.toString();
  }
  // 返回拼接后的URL字符串
  return urlObj.toString();
}
