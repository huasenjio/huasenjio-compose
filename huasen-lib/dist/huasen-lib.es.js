import "core-js";
import s from "crypto";
import h from "constants";
function d(e, t, r) {
  r && e();
  let n = null;
  function i() {
    clearTimeout(n), e(), n = setTimeout(i, t);
  }
  return n = setTimeout(i, t), {
    clear() {
      clearTimeout(n);
    }
  };
}
const E = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  timeout2Interval: d
}, Symbol.toStringTag, { value: "Module" })), a = h.RSA_PKCS1_OAEP_PADDING;
function y(e, t, r, n, i) {
  return s.publicEncrypt(
    {
      key: t,
      padding: i || a
    },
    Buffer.from(e, r)
  ).toString(n);
}
function g(e, t, r, n, i) {
  return s.publicDecrypt(
    {
      key: t,
      padding: i || a
    },
    Buffer.from(e, r)
  ).toString(n);
}
function m(e, t, r, n, i) {
  return s.privateEncrypt(
    {
      key: t,
      padding: a
    },
    Buffer.from(e, r)
  ).toString(n);
}
function A(e, t, r, n, i) {
  return s.privateDecrypt(
    {
      key: t,
      padding: a
    },
    Buffer.from(e, r)
  ).toString(n);
}
function D(e, t, r, n) {
  let i = 0, c = [];
  for (; r[i * n]; ) {
    let o = i * n, f = (i + 1) * n;
    c.push(r.slice(o, f)), i++;
  }
  let u = [];
  for (let o = 0; o < c.length; o++) {
    let f = e === "public" ? y(c[o], t, "utf8", "hex", a) : m(c[o], t, "utf8", "hex");
    u.push(f);
  }
  return u.join(":hs:");
}
function j(e, t, r) {
  return r.split(":hs:").reduce((i, c) => {
    let u = e === "public" ? g(c, t, "hex", "utf8", a) : A(c, t, "hex", "utf8");
    return i + u;
  }, "");
}
function p() {
  const e = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let t = "";
  const r = e.length;
  for (let n = 0; n < 16; n++)
    t += e.charAt(Math.floor(Math.random() * r));
  return t;
}
function z() {
  return [p(), p()];
}
function O(e, t) {
  t = t;
  let r = [], n = s.createDecipheriv("aes-128-cbc", t[0], t[1]);
  return n.setAutoPadding(!0), r.push(n.update(e, "base64", "utf8")), r.push(n.final("utf8")), r.join("");
}
function Z(e, t) {
  t = t || aesSecret;
  let r = [], n = s.createCipheriv("aes-128-cbc", t[0], t[1]);
  return n.setAutoPadding(!0), r.push(n.update(e, "utf8", "base64")), r.push(n.final("base64")), r.join("");
}
let b = {
  /**
   * 判断是否小于限定长度
   * @param {string} value - 输入值
   * @param {number} length - 最小长度
   * @param {string} invalidMsg - 错误提示信息
   * @returns 
   */
  minLength: function(e, t, r) {
    if (e && e.length < t)
      return r;
  },
  /**
   * 判断是否大于限定长度
   * @param {string} value - 输入值
   * @param {number} length - 最大长度
   * @param {string} invalidMsg - 错误提示信息
   * @returns 
   */
  maxLength: function(e, t, r) {
    if (e && e.length > t)
      return r;
  },
  /**
   * 判断是否满足非空字符串
   * @param {string} value - 输入值
   * @param {string} invalidMsg - 错误提示信息
   * @returns 
   */
  isNonEmpty: function(e, t) {
    if (e === "")
      return t;
  },
  /**
   * 判断是否满足整数
   * @param {string|number} value - 输入值
   * @param {string} invalidMsg - 错误提示信息
   * @returns 
   */
  isInteger: function(e, t) {
    if (e !== "" && !/^[0-9]+$/.test(e))
      return t;
  },
  /**
   * 判断输入值是否满足密码要求，即：仅支持数字、字母、下划线
   * @param {string} value - 输入值
   * @param {string} invalidMsg - 错误提示信息
   * @returns 
   */
  isPassword: function(e, t) {
    if (e !== "" && !/(^\w+$)/.test(e))
      return t;
  },
  /**
   * 判断输入值是否满足名字要求，即：仅支持汉字、数字、字母，不包含符号
   * @param {string} value - 输入值
   * @param {string} invalidMsg - 错误提示信息
   * @returns 
   */
  isName: function(e, t) {
    if (e !== "" && !/^[\u4E00-\u9FA5\uf900-\ufa2d0-9a-zA-Z]+$/.test(e))
      return t;
  },
  /**
   * 判断是否满足网址链接，必须携带协议头，支持http、https、ipv4、ipv6
   * @param {string} value - 输入值
   * @param {string} invalidMsg - 错误提示信息
   * @returns 
   */
  isUrl: function(e, t) {
    if (e !== "" && !/^((https?:\/\/)|(www\.))((([0-9]{1,3}\.){3}[0-9]{1,3})|localhost|(([a-zA-Z0-9\\-]+\.)+[a-zA-Z0-9]+)|(\[[0-9a-fA-F:]+\]))/.test(e))
      return t;
  },
  /**
   * 判断是否满足颜色代码要求，即：#fff、#000000、rgb(0,0,0)、rgba(0,0,0,0)
   * @param {string} value - 输入值
   * @param {string} invalidMsg - 错误提示信息
   * @returns 
   */
  isColor: function(e, t) {
    if (e !== "" && !/^(#([0-9A-Fa-f]{3}){1,2}|rgb\(\d{1,3},\s*\d{1,3},\s*\d{1,3}\)|rgba\(\d{1,3},\s*\d{1,3},\s*\d{1,3},\s*(0(\.\d+)?|1(\.0+)?)\))$/.test(e))
      return t;
  },
  /**
   * 判断是否满足IP要求，即：localhost、ipv4
   * @param {string} value - 输入值
   * @param {string} invalidMsg - 错误提示信息
   * @returns 
   */
  isIp: function(e, t) {
    if (e !== "" && !/^(localhost|([0-9]{1,3}\.){3}[0-9]{1,3})$/.test(e))
      return t;
  },
  /**
   * 判断是否满足邮箱要求
   * @param {string} value - 输入值
   * @param {string} invalidMsg - 错误提示信息
   * @returns 
   */
  isEmail: function(e, t) {
    if (e !== "" && !/^[A-Za-z0-9]+([-._][A-Za-z0-9]+)*@[A-Za-z0-9]+(-[A-Za-z0-9]+)*(\.[A-Za-z]{2,6}|[A-Za-z]{2,4}\.[A-Za-z]{2,3})$/.test(e))
      return t;
  },
  /**
   * 判断是否JSON对象要求
   * @param {string} value - 输入值
   * @param {string} invalidMsg - 错误提示信息
   * @returns 
   */
  isJSONObject: function(e, t) {
    try {
      if (e === "") return;
      let r = JSON.parse(e);
      if (!(Object.prototype.toString.call(r) === "[object Object]")) return t;
    } catch {
      return t;
    }
  },
  /**
   * 判断是否JSON数组要求
   * @param {string} value - 输入值
   * @param {string} invalidMsg - 错误提示信息
   * @returns 
   */
  isJSONArray: function(e, t) {
    try {
      if (e === "") return;
      let r = JSON.parse(e);
      if (!(Object.prototype.toString.call(r) === "[object Array]")) return t;
    } catch {
      return t;
    }
  }
};
class l {
  constructor() {
    this.caches = [];
  }
  /**
   * 添加校验规则
   * @param {string} value - 校验值
   * @param {array} rules - 校验规则，格式：[{strategy, errMsg}]
   */
  add(t, r) {
    r.map((n) => {
      let i = n.strategy.split(/:|：/), c = i.shift();
      i.unshift(t), i.push(n.errMsg), this.caches.push(() => b[c].apply(this, i));
    });
  }
  /**
   * 校验缓存区的规则
   * @returns {string} 错误提示信息
   */
  start() {
    for (let t of this.caches) {
      let r = t();
      if (r)
        return r;
    }
  }
  /**
   * 多项校验
   * @param {array} list - 校验项列表，格式：[{value, rules: [{strategy, errMsg}]}]
   * @returns {string} 错误提示信息 
   */
  verify(t) {
    this.clear();
    for (let r of t) {
      let n = new l();
      n.add(r.value, r.rules);
      let i = n.start();
      if (i)
        return i;
    }
  }
  /**
   * 获取 el-form 控件 rules 配置中 validator 验证规则
   * @param {array} strategyList - 校验策略规则数组 ['isNonEmpty::必填项']
   * @returns
   */
  getElementFormValidator(t) {
    let r = t.map((i) => {
      let c = i.split("::");
      return {
        strategy: c[0],
        errMsg: c[1]
      };
    }), n = this;
    return function(i, c, u) {
      let o = n.verify([
        {
          rules: r,
          value: c
        }
      ]);
      o ? u(new Error(o)) : u();
    };
  }
  clear() {
    this.caches = [];
  }
}
export {
  l as Validator,
  O as decrypt,
  Z as encrypt,
  z as getAESSecret,
  A as privateDecrypt,
  m as privateEncrypt,
  g as publicDecrypt,
  y as publicEncrypt,
  j as rsaDecryptLong,
  D as rsaEncryptLong,
  b as strategies,
  E as tool
};
