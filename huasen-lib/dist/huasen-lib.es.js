var $t = Object.defineProperty, St = Object.defineProperties;
var bt = Object.getOwnPropertyDescriptors;
var Q = Object.getOwnPropertySymbols;
var At = Object.prototype.hasOwnProperty, Et = Object.prototype.propertyIsEnumerable;
var tt = (t, e, r) => e in t ? $t(t, e, { enumerable: !0, configurable: !0, writable: !0, value: r }) : t[e] = r, F = (t, e) => {
  for (var r in e || (e = {}))
    At.call(e, r) && tt(t, r, e[r]);
  if (Q)
    for (var r of Q(e))
      Et.call(e, r) && tt(t, r, e[r]);
  return t;
}, et = (t, e) => St(t, bt(e));
var rt = (t, e, r) => new Promise((n, a) => {
  var h = (g) => {
    try {
      m(r.next(g));
    } catch (w) {
      a(w);
    }
  }, $ = (g) => {
    try {
      m(r.throw(g));
    } catch (w) {
      a(w);
    }
  }, m = (g) => g.done ? n(g.value) : Promise.resolve(g.value).then(h, $);
  m((r = r.apply(t, e)).next());
});
import "core-js";
import D from "crypto";
import st from "axios";
function wt(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
var z = { exports: {} }, vt = z.exports, nt;
function Mt() {
  return nt || (nt = 1, function(t, e) {
    (function(r, n) {
      t.exports = n();
    })(vt, function() {
      var r = 1e3, n = 6e4, a = 36e5, h = "millisecond", $ = "second", m = "minute", g = "hour", w = "day", R = "week", M = "month", W = "quarter", O = "year", j = "date", G = "Invalid Date", pt = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/, mt = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g, gt = { name: "en", weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"), months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"), ordinal: function(c) {
        var o = ["th", "st", "nd", "rd"], i = c % 100;
        return "[" + c + (o[(i - 20) % 10] || o[i] || o[0]) + "]";
      } }, B = function(c, o, i) {
        var u = String(c);
        return !u || u.length >= o ? c : "" + Array(o + 1 - u.length).join(i) + c;
      }, yt = { s: B, z: function(c) {
        var o = -c.utcOffset(), i = Math.abs(o), u = Math.floor(i / 60), s = i % 60;
        return (o <= 0 ? "+" : "-") + B(u, 2, "0") + ":" + B(s, 2, "0");
      }, m: function c(o, i) {
        if (o.date() < i.date()) return -c(i, o);
        var u = 12 * (i.year() - o.year()) + (i.month() - o.month()), s = o.clone().add(u, M), f = i - s < 0, l = o.clone().add(u + (f ? -1 : 1), M);
        return +(-(u + (i - s) / (f ? s - l : l - s)) || 0);
      }, a: function(c) {
        return c < 0 ? Math.ceil(c) || 0 : Math.floor(c);
      }, p: function(c) {
        return { M, y: O, w: R, d: w, D: j, h: g, m, s: $, ms: h, Q: W }[c] || String(c || "").toLowerCase().replace(/s$/, "");
      }, u: function(c) {
        return c === void 0;
      } }, N = "en", _ = {};
      _[N] = gt;
      var X = "$isDayjsObject", J = function(c) {
        return c instanceof k || !(!c || !c[X]);
      }, P = function c(o, i, u) {
        var s;
        if (!o) return N;
        if (typeof o == "string") {
          var f = o.toLowerCase();
          _[f] && (s = f), i && (_[f] = i, s = f);
          var l = o.split("-");
          if (!s && l.length > 1) return c(l[0]);
        } else {
          var p = o.name;
          _[p] = o, s = p;
        }
        return !u && s && (N = s), s || !u && N;
      }, S = function(c, o) {
        if (J(c)) return c.clone();
        var i = typeof o == "object" ? o : {};
        return i.date = c, i.args = arguments, new k(i);
      }, d = yt;
      d.l = P, d.i = J, d.w = function(c, o) {
        return S(c, { locale: o.$L, utc: o.$u, x: o.$x, $offset: o.$offset });
      };
      var k = function() {
        function c(i) {
          this.$L = P(i.locale, null, !0), this.parse(i), this.$x = this.$x || i.x || {}, this[X] = !0;
        }
        var o = c.prototype;
        return o.parse = function(i) {
          this.$d = function(u) {
            var s = u.date, f = u.utc;
            if (s === null) return /* @__PURE__ */ new Date(NaN);
            if (d.u(s)) return /* @__PURE__ */ new Date();
            if (s instanceof Date) return new Date(s);
            if (typeof s == "string" && !/Z$/i.test(s)) {
              var l = s.match(pt);
              if (l) {
                var p = l[2] - 1 || 0, y = (l[7] || "0").substring(0, 3);
                return f ? new Date(Date.UTC(l[1], p, l[3] || 1, l[4] || 0, l[5] || 0, l[6] || 0, y)) : new Date(l[1], p, l[3] || 1, l[4] || 0, l[5] || 0, l[6] || 0, y);
              }
            }
            return new Date(s);
          }(i), this.init();
        }, o.init = function() {
          var i = this.$d;
          this.$y = i.getFullYear(), this.$M = i.getMonth(), this.$D = i.getDate(), this.$W = i.getDay(), this.$H = i.getHours(), this.$m = i.getMinutes(), this.$s = i.getSeconds(), this.$ms = i.getMilliseconds();
        }, o.$utils = function() {
          return d;
        }, o.isValid = function() {
          return this.$d.toString() !== G;
        }, o.isSame = function(i, u) {
          var s = S(i);
          return this.startOf(u) <= s && s <= this.endOf(u);
        }, o.isAfter = function(i, u) {
          return S(i) < this.startOf(u);
        }, o.isBefore = function(i, u) {
          return this.endOf(u) < S(i);
        }, o.$g = function(i, u, s) {
          return d.u(i) ? this[u] : this.set(s, i);
        }, o.unix = function() {
          return Math.floor(this.valueOf() / 1e3);
        }, o.valueOf = function() {
          return this.$d.getTime();
        }, o.startOf = function(i, u) {
          var s = this, f = !!d.u(u) || u, l = d.p(i), p = function(L, E) {
            var T = d.w(s.$u ? Date.UTC(s.$y, E, L) : new Date(s.$y, E, L), s);
            return f ? T : T.endOf(w);
          }, y = function(L, E) {
            return d.w(s.toDate()[L].apply(s.toDate("s"), (f ? [0, 0, 0, 0] : [23, 59, 59, 999]).slice(E)), s);
          }, b = this.$W, A = this.$M, v = this.$D, C = "set" + (this.$u ? "UTC" : "");
          switch (l) {
            case O:
              return f ? p(1, 0) : p(31, 11);
            case M:
              return f ? p(1, A) : p(0, A + 1);
            case R:
              var I = this.$locale().weekStart || 0, x = (b < I ? b + 7 : b) - I;
              return p(f ? v - x : v + (6 - x), A);
            case w:
            case j:
              return y(C + "Hours", 0);
            case g:
              return y(C + "Minutes", 1);
            case m:
              return y(C + "Seconds", 2);
            case $:
              return y(C + "Milliseconds", 3);
            default:
              return this.clone();
          }
        }, o.endOf = function(i) {
          return this.startOf(i, !1);
        }, o.$set = function(i, u) {
          var s, f = d.p(i), l = "set" + (this.$u ? "UTC" : ""), p = (s = {}, s[w] = l + "Date", s[j] = l + "Date", s[M] = l + "Month", s[O] = l + "FullYear", s[g] = l + "Hours", s[m] = l + "Minutes", s[$] = l + "Seconds", s[h] = l + "Milliseconds", s)[f], y = f === w ? this.$D + (u - this.$W) : u;
          if (f === M || f === O) {
            var b = this.clone().set(j, 1);
            b.$d[p](y), b.init(), this.$d = b.set(j, Math.min(this.$D, b.daysInMonth())).$d;
          } else p && this.$d[p](y);
          return this.init(), this;
        }, o.set = function(i, u) {
          return this.clone().$set(i, u);
        }, o.get = function(i) {
          return this[d.p(i)]();
        }, o.add = function(i, u) {
          var s, f = this;
          i = Number(i);
          var l = d.p(u), p = function(A) {
            var v = S(f);
            return d.w(v.date(v.date() + Math.round(A * i)), f);
          };
          if (l === M) return this.set(M, this.$M + i);
          if (l === O) return this.set(O, this.$y + i);
          if (l === w) return p(1);
          if (l === R) return p(7);
          var y = (s = {}, s[m] = n, s[g] = a, s[$] = r, s)[l] || 1, b = this.$d.getTime() + i * y;
          return d.w(b, this);
        }, o.subtract = function(i, u) {
          return this.add(-1 * i, u);
        }, o.format = function(i) {
          var u = this, s = this.$locale();
          if (!this.isValid()) return s.invalidDate || G;
          var f = i || "YYYY-MM-DDTHH:mm:ssZ", l = d.z(this), p = this.$H, y = this.$m, b = this.$M, A = s.weekdays, v = s.months, C = s.meridiem, I = function(E, T, H, U) {
            return E && (E[T] || E(u, f)) || H[T].slice(0, U);
          }, x = function(E) {
            return d.s(p % 12 || 12, E, "0");
          }, L = C || function(E, T, H) {
            var U = E < 12 ? "AM" : "PM";
            return H ? U.toLowerCase() : U;
          };
          return f.replace(mt, function(E, T) {
            return T || function(H) {
              switch (H) {
                case "YY":
                  return String(u.$y).slice(-2);
                case "YYYY":
                  return d.s(u.$y, 4, "0");
                case "M":
                  return b + 1;
                case "MM":
                  return d.s(b + 1, 2, "0");
                case "MMM":
                  return I(s.monthsShort, b, v, 3);
                case "MMMM":
                  return I(v, b);
                case "D":
                  return u.$D;
                case "DD":
                  return d.s(u.$D, 2, "0");
                case "d":
                  return String(u.$W);
                case "dd":
                  return I(s.weekdaysMin, u.$W, A, 2);
                case "ddd":
                  return I(s.weekdaysShort, u.$W, A, 3);
                case "dddd":
                  return A[u.$W];
                case "H":
                  return String(p);
                case "HH":
                  return d.s(p, 2, "0");
                case "h":
                  return x(1);
                case "hh":
                  return x(2);
                case "a":
                  return L(p, y, !0);
                case "A":
                  return L(p, y, !1);
                case "m":
                  return String(y);
                case "mm":
                  return d.s(y, 2, "0");
                case "s":
                  return String(u.$s);
                case "ss":
                  return d.s(u.$s, 2, "0");
                case "SSS":
                  return d.s(u.$ms, 3, "0");
                case "Z":
                  return l;
              }
              return null;
            }(E) || l.replace(":", "");
          });
        }, o.utcOffset = function() {
          return 15 * -Math.round(this.$d.getTimezoneOffset() / 15);
        }, o.diff = function(i, u, s) {
          var f, l = this, p = d.p(u), y = S(i), b = (y.utcOffset() - this.utcOffset()) * n, A = this - y, v = function() {
            return d.m(l, y);
          };
          switch (p) {
            case O:
              f = v() / 12;
              break;
            case M:
              f = v();
              break;
            case W:
              f = v() / 3;
              break;
            case R:
              f = (A - b) / 6048e5;
              break;
            case w:
              f = (A - b) / 864e5;
              break;
            case g:
              f = A / a;
              break;
            case m:
              f = A / n;
              break;
            case $:
              f = A / r;
              break;
            default:
              f = A;
          }
          return s ? f : d.a(f);
        }, o.daysInMonth = function() {
          return this.endOf(M).$D;
        }, o.$locale = function() {
          return _[this.$L];
        }, o.locale = function(i, u) {
          if (!i) return this.$L;
          var s = this.clone(), f = P(i, u, !0);
          return f && (s.$L = f), s;
        }, o.clone = function() {
          return d.w(this.$d, this);
        }, o.toDate = function() {
          return new Date(this.valueOf());
        }, o.toJSON = function() {
          return this.isValid() ? this.toISOString() : null;
        }, o.toISOString = function() {
          return this.$d.toISOString();
        }, o.toString = function() {
          return this.$d.toUTCString();
        }, c;
      }(), q = k.prototype;
      return S.prototype = q, [["$ms", h], ["$s", $], ["$m", m], ["$H", g], ["$W", w], ["$M", M], ["$y", O], ["$D", j]].forEach(function(c) {
        q[c[1]] = function(o) {
          return this.$g(o, c[0], c[1]);
        };
      }), S.extend = function(c, o) {
        return c.$i || (c(o, k, S), c.$i = !0), S;
      }, S.locale = P, S.isDayjs = J, S.unix = function(c) {
        return S(1e3 * c);
      }, S.en = _[N], S.Ls = _, S.p = {}, S;
    });
  }(z)), z.exports;
}
var Dt = Mt();
const Ot = /* @__PURE__ */ wt(Dt);
function Tt(t, e, r) {
  r && t();
  let n = null;
  function a() {
    clearTimeout(n), t(), n = setTimeout(a, e);
  }
  return n = setTimeout(a, e), {
    clear() {
      clearTimeout(n);
    }
  };
}
function _t(t, e = "YYYY-MM-DD HH:mm:ss") {
  return Ot(t).format(e);
}
function ot(t = 16, e = 8) {
  let r = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split(""), n = [], a;
  if (e = e || r.length, t)
    for (a = 0; a < t; a++) n[a] = r[0 | Math.random() * e];
  else {
    var h;
    for (n[8] = n[13] = n[18] = n[23] = "-", n[14] = "4", a = 0; a < 36; a++)
      n[a] || (h = 0 | Math.random() * 16, n[a] = r[a == 19 ? h & 3 | 8 : h]);
  }
  return n.join("");
}
function It() {
  return `${Date.now().toString(36)}-${ot(8)}`;
}
function Lt(t, e, r) {
  try {
    let n = JSON.parse(t);
    return e && Object.prototype.toString.call(n) !== `[object ${e}]` ? r : n;
  } catch (n) {
    return console.log(n), r;
  }
}
function jt() {
  let t = navigator.userAgent, e = t.indexOf("compatible") > -1 && t.indexOf("MSIE") > -1, r = t.indexOf("Edge") > -1 && !e, n = t.indexOf("Trident") > -1 && t.indexOf("rv:11.0") > -1;
  if (e) {
    new RegExp("MSIE (\\d+\\.\\d+);").test(t);
    let h = parseFloat(RegExp.$1);
    return h == 7 ? 7 : h == 8 ? 8 : h == 9 ? 9 : h == 10 ? 10 : 6;
  } else return r ? "edge" : n ? 11 : -1;
}
function Ct(t, e, r = !1) {
  var n = document.createElement(r ? "textarea" : "input");
  n.value = t, n.setAttribute("readonly", "readonly"), n.style.position = "fixed", n.style.left = "-9999px", document.body.appendChild(n), n.select(), n.setSelectionRange(0, n.value.length), document.execCommand("copy"), document.body.removeChild(n), typeof e == "function" && e();
}
function Nt(t, e) {
  const r = new FileReader();
  r.addEventListener("load", () => {
    e(r.result);
  }), r.readAsDataURL(t);
}
function xt(t = "", e = {}) {
  const r = new URL(t);
  if (Object.keys(e).length > 0) {
    const n = new URLSearchParams(r.search);
    for (const [a, h] of Object.entries(e))
      n.set(a, h);
    r.search = n.toString();
  }
  return r.toString();
}
function ut(t) {
  if (!t) return "";
  try {
    return /^https?:\/\//i.test(t) || (t = "http://" + t), new URL(t).hostname;
  } catch (e) {
    return "";
  }
}
const Ht = /* @__PURE__ */ new Set([
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
  "net.br"
]);
function Rt(t) {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(t);
}
function Pt(t) {
  return t.includes(":");
}
function K(t) {
  const e = ut(t).toLowerCase().replace(/\.$/, "");
  if (!e || e === "localhost" || Rt(e) || Pt(e))
    return e;
  const r = e.replace(/^www\./, ""), n = r.split(".").filter(Boolean);
  if (n.length <= 2) return r;
  const a = n.slice(-2).join("."), h = Ht.has(a) ? 3 : 2;
  return n.slice(-h).join(".");
}
function kt(t, e = "") {
  var r;
  if (t)
    return t.startsWith("http://") || t.startsWith("https://") ? t : ((r = window == null ? void 0 : window.location) != null && r.origin && (e = window.location.origin), e = e.replace(/\/$/, ""), t.startsWith("/") || (t = `/${t}`), e + t);
}
const ie = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  copyTextToClip: Ct,
  formatDate: _t,
  getBase64: Nt,
  getDomain: ut,
  getFullURL: kt,
  getPrimaryDomain: K,
  getUUID: It,
  getUid: ot,
  handleURL: xt,
  judgeIE: jt,
  parseJSON: Lt,
  timeout2Interval: Tt
}, Symbol.toStringTag, { value: "Module" }));
function Ut(t, e) {
  try {
    const r = Buffer.from(t, "utf8");
    return D.publicEncrypt(e, r).toString("base64");
  } catch (r) {
    throw new Error(`公钥加密失败：${r.message}`);
  }
}
function Ft(t, e) {
  try {
    const r = Buffer.from(t, "base64");
    return D.publicDecrypt(e, r).toString("utf8");
  } catch (r) {
    throw new Error(`公钥解密失败：${r.message}`);
  }
}
function zt(t, e) {
  try {
    const r = Buffer.from(t, "utf8");
    return D.privateEncrypt(e, r).toString("base64");
  } catch (r) {
    throw new Error(`私钥加密失败：${r.message}`);
  }
}
function Yt(t, e) {
  try {
    const r = Buffer.from(t, "base64");
    return D.privateDecrypt(e, r).toString("utf8");
  } catch (r) {
    throw new Error(`私钥解密失败：${r.message}`);
  }
}
function se(t, e, r, n = 110) {
  let a = 0, h = [];
  for (; r[a * n]; ) {
    let m = a * n, g = (a + 1) * n;
    h.push(r.slice(m, g)), a++;
  }
  let $ = [];
  for (let m = 0; m < h.length; m++) {
    let g = t === "public" ? Ut(h[m], e) : zt(h[m], e);
    $.push(g);
  }
  return $.join(":@:hs:@:");
}
function oe(t, e, r) {
  return r.split(":@:hs:@:").reduce((a, h) => {
    let $ = t === "public" ? Ft(h, e) : Yt(h, e);
    return a + $;
  }, "");
}
function it() {
  const t = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let e = "";
  const r = t.length;
  for (let n = 0; n < 16; n++)
    e += t.charAt(Math.floor(Math.random() * r));
  return e;
}
function ue() {
  return [it(), it()];
}
function ae(t, e) {
  e = e;
  let r = [], n = D.createDecipheriv("aes-128-cbc", e[0], e[1]);
  return n.setAutoPadding(!0), r.push(n.update(t, "base64", "utf8")), r.push(n.final("utf8")), r.join("");
}
function ce(t, e) {
  e = e || aesSecret;
  let r = [], n = D.createCipheriv("aes-128-cbc", e[0], e[1]);
  return n.setAutoPadding(!0), r.push(n.update(t, "utf8", "base64")), r.push(n.final("base64")), r.join("");
}
let Bt = {
  /**
   * 判断是否小于限定长度
   * @param {string} value - 输入值
   * @param {number} length - 最小长度
   * @param {string} invalidMsg - 错误提示信息
   * @returns 
   */
  minLength: function(t, e, r) {
    if (t && t.length < e)
      return r;
  },
  /**
   * 判断是否大于限定长度
   * @param {string} value - 输入值
   * @param {number} length - 最大长度
   * @param {string} invalidMsg - 错误提示信息
   * @returns 
   */
  maxLength: function(t, e, r) {
    if (t && t.length > e)
      return r;
  },
  /**
   * 判断是否满足非空字符串
   * @param {string} value - 输入值
   * @param {string} invalidMsg - 错误提示信息
   * @returns 
   */
  isNonEmpty: function(t, e) {
    if (t === "")
      return e;
  },
  /**
   * 判断是否满足整数
   * @param {string|number} value - 输入值
   * @param {string} invalidMsg - 错误提示信息
   * @returns 
   */
  isInteger: function(t, e) {
    if (t !== "" && !/^[0-9]+$/.test(t))
      return e;
  },
  /**
   * 判断输入值是否满足密码要求，即：仅支持数字、字母、下划线
   * @param {string} value - 输入值
   * @param {string} invalidMsg - 错误提示信息
   * @returns 
   */
  isPassword: function(t, e) {
    if (t !== "" && !/(^\w+$)/.test(t))
      return e;
  },
  /**
   * 判断输入值是否满足名字要求，即：仅支持汉字、数字、字母，不包含符号
   * @param {string} value - 输入值
   * @param {string} invalidMsg - 错误提示信息
   * @returns 
   */
  isName: function(t, e) {
    if (t !== "" && !/^[\u4E00-\u9FA5\uf900-\ufa2d0-9a-zA-Z]+$/.test(t))
      return e;
  },
  /**
   * 判断是否满足网址链接，必须携带协议头，支持http、https、ipv4、ipv6
   * @param {string} value - 输入值
   * @param {string} invalidMsg - 错误提示信息
   * @returns 
   */
  isUrl: function(t, e) {
    if (t !== "" && !/^((https?:\/\/)|(www\.))((([0-9]{1,3}\.){3}[0-9]{1,3})|localhost|(([a-zA-Z0-9\\-]+\.)+[a-zA-Z0-9]+)|(\[[0-9a-fA-F:]+\]))/.test(t))
      return e;
  },
  /**
   * 判断是否满足颜色代码要求，即：#fff、#000000、rgb(0,0,0)、rgba(0,0,0,0)
   * @param {string} value - 输入值
   * @param {string} invalidMsg - 错误提示信息
   * @returns 
   */
  isColor: function(t, e) {
    if (t !== "" && !/^(#([0-9A-Fa-f]{3}){1,2}|rgb\(\d{1,3},\s*\d{1,3},\s*\d{1,3}\)|rgba\(\d{1,3},\s*\d{1,3},\s*\d{1,3},\s*(0(\.\d+)?|1(\.0+)?)\))$/.test(t))
      return e;
  },
  /**
   * 判断是否满足IP要求，即：localhost、ipv4
   * @param {string} value - 输入值
   * @param {string} invalidMsg - 错误提示信息
   * @returns 
   */
  isIp: function(t, e) {
    if (t !== "" && !/^(localhost|([0-9]{1,3}\.){3}[0-9]{1,3})$/.test(t))
      return e;
  },
  /**
   * 判断是否满足邮箱要求
   * @param {string} value - 输入值
   * @param {string} invalidMsg - 错误提示信息
   * @returns 
   */
  isEmail: function(t, e) {
    if (t !== "" && !/^[A-Za-z0-9]+([-._][A-Za-z0-9]+)*@[A-Za-z0-9]+(-[A-Za-z0-9]+)*(\.[A-Za-z]{2,6}|[A-Za-z]{2,4}\.[A-Za-z]{2,3})$/.test(t))
      return e;
  },
  /**
   * 判断是否JSON对象要求
   * @param {string} value - 输入值
   * @param {string} invalidMsg - 错误提示信息
   * @returns 
   */
  isJSONObject: function(t, e) {
    try {
      if (t === "") return;
      let r = JSON.parse(t);
      if (!(Object.prototype.toString.call(r) === "[object Object]")) return e;
    } catch (r) {
      return e;
    }
  },
  /**
   * 判断是否JSON数组要求
   * @param {string} value - 输入值
   * @param {string} invalidMsg - 错误提示信息
   * @returns 
   */
  isJSONArray: function(t, e) {
    try {
      if (t === "") return;
      let r = JSON.parse(t);
      if (!(Object.prototype.toString.call(r) === "[object Array]")) return e;
    } catch (r) {
      return e;
    }
  }
};
class at {
  constructor() {
    this.caches = [];
  }
  /**
   * 添加校验规则
   * @param {string} value - 校验值
   * @param {array} rules - 校验规则，格式：[{strategy, errMsg}]
   */
  add(e, r) {
    r.map((n) => {
      let a = n.strategy.split(/:|：/), h = a.shift();
      a.unshift(e), a.push(n.errMsg), this.caches.push(() => Bt[h].apply(this, a));
    });
  }
  /**
   * 校验缓存区的规则
   * @returns {string} 错误提示信息
   */
  start() {
    for (let e of this.caches) {
      let r = e();
      if (r)
        return r;
    }
  }
  /**
   * 多项校验
   * @param {array} list - 校验项列表，格式：[{value, rules: [{strategy, errMsg}]}]
   * @returns {string} 错误提示信息 
   */
  verify(e) {
    this.clear();
    for (let r of e) {
      let n = new at();
      n.add(r.value, r.rules);
      let a = n.start();
      if (a)
        return a;
    }
  }
  /**
   * 获取 el-form 控件 rules 配置中 validator 验证规则
   * @param {array} strategyList - 校验策略规则数组 ['isNonEmpty::必填项']
   * @returns
   */
  getElementFormValidator(e) {
    let r = e.map((a) => {
      let h = a.split("::");
      return {
        strategy: h[0],
        errMsg: h[1]
      };
    }), n = this;
    return function(a, h, $) {
      let m = n.verify([
        {
          rules: r,
          value: h
        }
      ]);
      m ? $(new Error(m)) : $();
    };
  }
  clear() {
    this.caches = [];
  }
}
class fe {
  /**
   * 防抖类
   * @param {Object} scope - 作用域
   * @param {Number} delay - 延迟时间
   */
  constructor(e, r = 10) {
    this.delay = r, this.timer = null, this.previous = 0, this.now = 0, this.scope = e;
  }
  /**
   * 执行函数
   * @param {Function} func - 函数
   * @param {Object} param - 参数
   */
  run(e, r) {
    const n = this.scope;
    this.now = (/* @__PURE__ */ new Date()).getTime(), this.now - this.previous < this.delay && clearTimeout(this.timer), this.timer = setTimeout(
      function() {
        e.call(n, r), this.timer = null;
      }.bind(this),
      this.delay
    ), this.previous = this.now;
  }
}
function le(t) {
  return rt(this, null, function* () {
    let e;
    try {
      if (Object.prototype.toString.call(t) === "[object Promise]")
        e = t;
      else if (Object.prototype.toString.call(t) === "[object AsyncFunction]")
        e = t();
      else if (typeof t == "function")
        e = Promise.resolve(t());
      else
        throw new Error("flatAsync 参数必须为函数或 Promise 对象");
      return [null, yield e];
    } catch (r) {
      return [r, null];
    }
  });
}
function he(t, e, r = {}) {
  return st.post(t, e, {
    headers: F({
      "Content-Type": "application/json"
    }, r.headers || {}),
    timeout: r.timeout
  }).then((n) => ({
    statusCode: n.status,
    body: n.data
  }));
}
function de(t, e = {}) {
  return st.get(t, {
    headers: F({
      "Content-Type": "application/json"
    }, e.headers || {}),
    timeout: e.timeout
  }).then((r) => ({
    statusCode: r.status,
    body: r.data
  }));
}
const ct = "RSA-SHA256", Jt = 1, ft = ".", Zt = Object.freeze(["TOKEN_MALFORMED", "TOKEN_INVALID_SIGNATURE", "LEASE_EXPIRED", "SOURCE_HASH_MISMATCH", "ABILITY_HASH_MISMATCH"]);
function lt(t = "") {
  return String(t || "").replace(/\\n/g, `
`).trim();
}
function Kt(t) {
  return Buffer.from(t, "utf8").toString("base64url");
}
function Vt(t) {
  return Buffer.from(t, "base64url").toString("utf8");
}
function Y(t) {
  return Array.isArray(t) ? `[${t.map((e) => Y(e)).join(",")}]` : t && typeof t == "object" ? `{${Object.keys(t).sort().map((e) => `${JSON.stringify(e)}:${Y(t[e])}`).join(",")}}` : JSON.stringify(t);
}
function V(t) {
  const e = typeof t == "string" ? t : Y(t);
  return D.createHash("sha256").update(e).digest("hex");
}
function pe(t) {
  return V(String(t || ""));
}
function Z(t) {
  if (!t) return null;
  const e = new Date(t);
  return Number.isNaN(e.getTime()) ? null : e.toISOString();
}
function Wt(t = []) {
  return (t || []).filter((e) => e && e.abilityCode).map((e) => ({
    abilityCode: e.abilityCode,
    name: e.name || "",
    icon: e.icon || "",
    enabled: e.enabled !== !1,
    code: e.code || 0
  })).sort((e, r) => e.abilityCode.localeCompare(r.abilityCode));
}
function me(t = []) {
  return V(Wt(t));
}
function Gt(t = null) {
  return t ? {
    version: t.version || "",
    source: t.source || ""
  } : null;
}
function ge(t = null) {
  const e = Gt(t);
  return e ? V(e) : "";
}
function Xt(t) {
  return et(F({}, t), {
    version: t.version || Jt,
    issuedAt: Z(t.issuedAt || /* @__PURE__ */ new Date()),
    expireAt: Z(t.expireAt),
    leaseExpireAt: Z(t.leaseExpireAt)
  });
}
function qt(t, e, r) {
  try {
    return D.createVerify(ct).update(t).end().verify(r, e, "base64url");
  } catch (n) {
    return !1;
  }
}
function ye(t, e) {
  const r = lt(e);
  if (!r) throw new Error("缺少授权签名私钥");
  const n = Kt(Y(Xt(t))), a = D.createSign(ct).update(n).end().sign(r, "base64url");
  return `${n}${ft}${a}`;
}
function ht(t) {
  if (!t || typeof t != "string") return null;
  const [e, r] = t.split(ft);
  if (!e || !r) return null;
  try {
    return {
      body: e,
      signature: r,
      payload: JSON.parse(Vt(e))
    };
  } catch (n) {
    return null;
  }
}
function dt(t, e) {
  const r = lt(e);
  return r ? qt(
    t.body,
    t.signature,
    r
  ) ? { valid: !0, reason: "", payload: t.payload } : {
    valid: !1,
    reason: "TOKEN_INVALID_SIGNATURE",
    payload: t.payload
  } : {
    valid: !1,
    reason: "PUBLIC_KEY_MISSING",
    payload: t.payload
  };
}
function Qt(t, e = {}) {
  const r = e.now ? new Date(e.now) : /* @__PURE__ */ new Date(), n = K(e.domain || ""), a = K(t.domain || ""), h = e.fingerprint || "", $ = e.feature || "";
  if (a && a !== n)
    return { valid: !1, reason: "DOMAIN_MISMATCH", payload: t };
  if ((t.fingerprints || []).length && !t.fingerprints.includes(h))
    return { valid: !1, reason: "FINGERPRINT_MISMATCH", payload: t };
  if ($ && !(t.features || []).includes($))
    return { valid: !1, reason: "FEATURE_UNAVAILABLE", payload: t };
  const m = t.expireAt ? new Date(t.expireAt) : null;
  if (t.type !== "permanent" && (!m || m < r))
    return { valid: !1, reason: "LICENSE_EXPIRED", payload: t };
  const g = t.leaseExpireAt ? new Date(t.leaseExpireAt) : null;
  return !g || g < r ? { valid: !1, reason: "LEASE_EXPIRED", payload: t } : e.sourceHash && t.sourceHash && e.sourceHash !== t.sourceHash ? { valid: !1, reason: "SOURCE_HASH_MISMATCH", payload: t } : e.abilityHash && t.abilityHash && e.abilityHash !== t.abilityHash ? { valid: !1, reason: "ABILITY_HASH_MISMATCH", payload: t } : { valid: !0, reason: "", payload: t };
}
function $e(t, e, r = {}) {
  const n = ht(t);
  if (!n) return { valid: !1, reason: "TOKEN_MALFORMED" };
  const a = dt(n, e);
  return a.valid ? Qt(n.payload || {}, r) : a;
}
function Se(t, e) {
  const r = ht(t);
  return r ? dt(r, e) : { valid: !1, reason: "TOKEN_MALFORMED" };
}
function be(t, e = 24 * 60 * 60 * 1e3) {
  if (!t || !t.leaseExpireAt) return !0;
  const r = new Date(t.leaseExpireAt).getTime();
  return Number.isNaN(r) || r - Date.now() <= e;
}
function Ae(t) {
  return Zt.includes(t);
}
export {
  fe as AF,
  Zt as LICENSE_SYNCABLE_FAILURE_REASONS,
  Jt as TOKEN_VERSION,
  at as Validator,
  me as createAbilityHash,
  pe as createLicenseKeyHash,
  ge as createPluginSourceHash,
  Ot as dayjs,
  ht as decodeLicenseToken,
  ae as decrypt,
  ce as encrypt,
  le as flatAsync,
  ue as getAESSecret,
  de as getJSON,
  Ae as isLicenseSyncableFailureReason,
  lt as normalizePem,
  he as postJSON,
  Yt as privateDecrypt,
  zt as privateEncrypt,
  Ft as publicDecrypt,
  Ut as publicEncrypt,
  oe as rsaDecryptLong,
  se as rsaEncryptLong,
  V as sha256,
  be as shouldRefreshLease,
  ye as signLicenseToken,
  Y as stableStringify,
  Bt as strategies,
  ie as tool,
  $e as verifyLicenseToken,
  Se as verifyLicenseTokenSignature
};
