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
 * 获取唯一标识符
 * @returns {String} 唯一标识符，例如：mkteczzq-47643337
 */
export function getUUID() {
  const time36 = Date.now().toString(36); // 时间戳36进制：'mkteczzq'
  return `${time36}-${getUid(8)}`;
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
  copyEl.value = content;
  copyEl.setAttribute("readonly", "readonly");
  copyEl.style.position = "fixed";
  copyEl.style.left = "-9999px";
  document.body.appendChild(copyEl);
  copyEl.select();
  copyEl.setSelectionRange(0, copyEl.value.length);
  document.execCommand("copy");
  document.body.removeChild(copyEl);
  if (typeof callback === "function") {
    callback();
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

/**
 * 从 URL 或主机名字符串中提取域名（hostname），使用原生 URL 构造函数解析
 * @param {String} urlStr - 完整 URL 或带端口的主机名，例如 'https://example.com:3000/path'、'localhost:9000'
 * @returns {String} 解析的域名，解析失败时返回空字符串
 */
export function getDomain(urlStr) {
  if (!urlStr) return "";
  try {
    if (!/^https?:\/\//i.test(urlStr)) {
      urlStr = "http://" + urlStr;
    }
    return new URL(urlStr).hostname;
  } catch (e) {
    return "";
  }
}

const MULTI_PART_PUBLIC_SUFFIXES = new Set([
  "com.cn",
  "net.cn",
  "org.cn",
  "gov.cn",
  "edu.cn",
  "ac.cn",
  "co.uk",
  "org.uk",
  "ac.uk",
  "gov.uk",
  "com.au",
  "net.au",
  "org.au",
  "edu.au",
  "co.jp",
  "ne.jp",
  "or.jp",
  "co.kr",
  "ne.kr",
  "or.kr",
  "com.br",
  "net.br",
]);

function isIPv4(hostname) {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
}

function isIPv6(hostname) {
  return hostname.includes(":");
}

/**
 * 从 URL 或主机名字符串中提取主域名，用于授权域名绑定。
 * @param {String} urlStr - 完整 URL 或主机名，例如 'https://www.example.com/admin'、'n.example.com'
 * @returns {String} 主域名，解析失败时返回空字符串
 */
export function getPrimaryDomain(urlStr) {
  const hostname = getDomain(urlStr).toLowerCase().replace(/\.$/, "");
  if (
    !hostname ||
    hostname === "localhost" ||
    isIPv4(hostname) ||
    isIPv6(hostname)
  )
    return hostname;

  const normalizedHostname = hostname.replace(/^www\./, "");
  const parts = normalizedHostname.split(".").filter(Boolean);
  if (parts.length <= 2) return normalizedHostname;

  const suffix = parts.slice(-2).join(".");
  const suffixLength = MULTI_PART_PUBLIC_SUFFIXES.has(suffix) ? 3 : 2;
  return parts.slice(-suffixLength).join(".");
}

/**
 * 获取完整URL参数地址，兼容浏览器和node环境
 * @param {String} url - 地址，例如：/img/favicon.png
 * @param {String} origin - 域名，例如：https://127.0.0.1:3000
 * @returns 完整URL参数地址
 */
export function getFullURL(url, origin = "") {
  if (!url) return;
  // 若传入完整URL，直接返回
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  if (window?.location?.origin) {
    origin = window.location.origin;
  }
  origin = origin.replace(/\/$/, "");
  if (!url.startsWith("/")) {
    url = `/${url}`;
  }
  return origin + url;
}
