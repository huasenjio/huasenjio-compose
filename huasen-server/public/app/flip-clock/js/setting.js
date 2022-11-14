(function (e) {
  function t(t) {
    for (
      var c, l, r = t[0], a = t[1], u = t[2], m = 0, b = [];
      m < r.length;
      m++
    )
      (l = r[m]),
        Object.prototype.hasOwnProperty.call(i, l) && i[l] && b.push(i[l][0]),
        (i[l] = 0);
    for (c in a) Object.prototype.hasOwnProperty.call(a, c) && (e[c] = a[c]);
    s && s(t);
    while (b.length) b.shift()();
    return o.push.apply(o, u || []), n();
  }

  function n() {
    for (var e, t = 0; t < o.length; t++) {
      for (var n = o[t], c = !0, r = 1; r < n.length; r++) {
        var a = n[r];
        0 !== i[a] && (c = !1);
      }
      c && (o.splice(t--, 1), (e = l((l.s = n[0]))));
    }
    return e;
  }
  var c = {},
    i = {
      app: 0,
    },
    o = [];

  function l(t) {
    if (c[t]) return c[t].exports;
    var n = (c[t] = {
      i: t,
      l: !1,
      exports: {},
    });
    return e[t].call(n.exports, n, n.exports, l), (n.l = !0), n.exports;
  }
  (l.m = e),
    (l.c = c),
    (l.d = function (e, t, n) {
      l.o(e, t) ||
        Object.defineProperty(e, t, {
          enumerable: !0,
          get: n,
        });
    }),
    (l.r = function (e) {
      "undefined" !== typeof Symbol &&
        Symbol.toStringTag &&
        Object.defineProperty(e, Symbol.toStringTag, {
          value: "Module",
        }),
        Object.defineProperty(e, "__esModule", {
          value: !0,
        });
    }),
    (l.t = function (e, t) {
      if ((1 & t && (e = l(e)), 8 & t)) return e;
      if (4 & t && "object" === typeof e && e && e.__esModule) return e;
      var n = Object.create(null);
      if (
        (l.r(n),
        Object.defineProperty(n, "default", {
          enumerable: !0,
          value: e,
        }),
        2 & t && "string" != typeof e)
      )
        for (var c in e)
          l.d(
            n,
            c,
            function (t) {
              return e[t];
            }.bind(null, c)
          );
      return n;
    }),
    (l.n = function (e) {
      var t =
        e && e.__esModule
          ? function () {
              return e["default"];
            }
          : function () {
              return e;
            };
      return l.d(t, "a", t), t;
    }),
    (l.o = function (e, t) {
      return Object.prototype.hasOwnProperty.call(e, t);
    }),
    (l.p = "");
  var r = (window["webpackJsonp"] = window["webpackJsonp"] || []),
    a = r.push.bind(r);
  (r.push = t), (r = r.slice());
  for (var u = 0; u < r.length; u++) t(r[u]);
  var s = a;
  o.push([0, "chunk-vendors"]), n();
})({
  0: function (e, t, n) {
    e.exports = n("56d7");
  },
  2294: function (e, t, n) {},
  "29e8": function (e, t, n) {},
  "56d7": function (e, t, n) {
    "use strict";
    n.r(t);
    n("e260"), n("e6cf"), n("cca6"), n("a79d");
    var c = n("7a23"),
      i = {
        class: "bg",
      },
      o = Object(c["e"])(
        "div",
        {
          style: {
            color: "#666",
          },
        },
        "click or space",
        -1
      ),
      l = {
        class: "set_box_inner",
      },
      r = Object(c["e"])(
        "div",
        {
          class: "setName",
        },
        "时间格式:",
        -1
      ),
      a = {
        class: "pickItem",
      },
      u = Object(c["e"])(
        "div",
        {
          class: "setName",
        },
        "比例:",
        -1
      ),
      s = {
        style: {
          width: "32px",
          "padding-left": "8px",
        },
      },
      m = Object(c["e"])(
        "div",
        {
          class: "setName",
        },
        "亮度:",
        -1
      ),
      b = {
        style: {
          width: "32px",
          "padding-left": "8px",
        },
      },
      f = Object(c["e"])(
        "div",
        {
          class: "setName",
        },
        "显示:",
        -1
      ),
      d = Object(c["e"])("span", null, "背景颜色", -1),
      p = Object(c["e"])("span", null, "时分秒", -1),
      h = Object(c["e"])(
        "div",
        {
          class: "setName",
        },
        "秒表:",
        -1
      ),
      g = Object(c["e"])(
        "div",
        {
          class: "setName",
        },
        "计时器:",
        -1
      ),
      v = Object(c["e"])(
        "span",
        {
          class: "iconTime",
        },
        null,
        -1
      ),
      O = Object(c["e"])(
        "span",
        {
          style: {
            "vertical-align": "middle",
          },
        },
        "5m",
        -1
      ),
      j = Object(c["e"])(
        "span",
        {
          class: "iconTime",
        },
        null,
        -1
      ),
      y = Object(c["e"])(
        "span",
        {
          style: {
            "vertical-align": "middle",
          },
        },
        "10m",
        -1
      ),
      w = Object(c["e"])(
        "span",
        {
          class: "iconTomato",
        },
        null,
        -1
      ),
      S = Object(c["e"])(
        "span",
        {
          style: {
            "vertical-align": "middle",
          },
        },
        "25m",
        -1
      ),
      T = Object(c["e"])(
        "span",
        {
          class: "iconCancel",
        },
        null,
        -1
      ),
      _ = Object(c["e"])(
        "span",
        {
          style: {
            "vertical-align": "middle",
          },
        },
        "Off",
        -1
      ),
      x = Object(c["e"])(
        "div",
        {
          class: "setName",
        },
        "我的计时器:",
        -1
      ),
      k = Object(c["e"])(
        "footer",
        {
          style: {
            position: "relative",
            margin: "-2px 20px 0px",
          },
        },
        [
          Object(c["e"])(
            "a",
            {
              href: "http://huasen.cc/",
              target: "_blank",
              style: {
                color: "#666",
              },
            },
            "1.0.1 @huasenjio·2021"
          ),
          Object(c["e"])(
            "span",
            {
              style: {
                position: "absolute",
                right: "0",
                color: "#fff",
              },
            },
            "按F11键进入全屏模式"
          ),
        ],
        -1
      );

    function C(e, t, n, C, V, B) {
      var M = Object(c["l"])("clock"),
        F = Object(c["l"])("slider"),
        N = Object(c["l"])("timePicker"),
        H = Object(c["l"])("setbox");
      return (
        Object(c["g"])(),
        Object(c["c"])("div", i, [
          Object(c["e"])(
            "div",
            {
              class: "timer",
              style: {
                transform: "translateY(-50%) scale(" + e.scale / 100 + ")",
                filter: "brightness(" + e.brightness / 100 + ")",
              },
            },
            [
              Object(c["e"])(
                M,
                {
                  class: [e.showSecond ? "timer_hms" : "timer_hm"],
                  cid: "clock_h",
                  msg: e.num_h,
                  ampm: 0 === e.hourFormat,
                  bg: e.showBg,
                },
                null,
                8,
                ["class", "msg", "ampm", "bg"]
              ),
              Object(c["e"])(
                M,
                {
                  class: [e.showSecond ? "timer_hms" : "timer_hm"],
                  cid: "clock_m",
                  msg: e.num_m,
                  bg: e.showBg,
                },
                null,
                8,
                ["class", "msg", "bg"]
              ),
              e.showSecond
                ? (Object(c["g"])(),
                  Object(c["c"])(
                    M,
                    {
                      key: 0,
                      class: [e.showSecond ? "timer_hms" : "timer_hm"],
                      cid: "clock_s",
                      msg: e.num_s,
                      bg: e.showBg,
                    },
                    null,
                    8,
                    ["class", "msg", "bg"]
                  ))
                : Object(c["d"])("", !0),
              Object(c["s"])(
                Object(c["e"])(
                  "div",
                  {
                    class: "watchBtn",
                    onClick:
                      t[1] ||
                      (t[1] = function () {
                        return C.startStop && C.startStop.apply(C, arguments);
                      }),
                  },
                  [
                    Object(c["e"])(
                      "div",
                      {
                        style: {
                          color: e.watching ? "red" : "green",
                        },
                      },
                      Object(c["m"])(e.watching ? "Stop" : "Start"),
                      5
                    ),
                    o,
                  ],
                  512
                ),
                [[c["p"], e.timeMode > 0]]
              ),
            ],
            4
          ),
          Object(c["e"])(
            H,
            {
              class: "set_box",
              ref: "setRef",
              onCloseSet: C.saveSet,
            },
            {
              default: Object(c["r"])(function () {
                return [
                  Object(c["e"])("ul", l, [
                    Object(c["e"])("li", null, [
                      r,
                      Object(c["e"])("ul", a, [
                        Object(c["e"])(
                          "li",
                          {
                            onClick:
                              t[2] ||
                              (t[2] = function (t) {
                                return (e.hourFormat = 0);
                              }),
                            class: {
                              "pick-active": 0 === e.hourFormat,
                            },
                          },
                          "12h",
                          2
                        ),
                        Object(c["e"])(
                          "li",
                          {
                            onClick:
                              t[3] ||
                              (t[3] = function (t) {
                                return (e.hourFormat = 1);
                              }),
                            class: {
                              "pick-active": 1 === e.hourFormat,
                            },
                          },
                          "24h",
                          2
                        ),
                        Object(c["e"])(
                          "li",
                          {
                            onClick:
                              t[4] ||
                              (t[4] = function (t) {
                                return (e.hourFormat = 2);
                              }),
                            class: {
                              "pick-active": 2 === e.hourFormat,
                            },
                          },
                          "024h",
                          2
                        ),
                      ]),
                    ]),
                    Object(c["e"])("li", null, [
                      u,
                      Object(c["e"])(
                        F,
                        {
                          modelValue: e.scale,
                          "onUpdate:modelValue":
                            t[5] ||
                            (t[5] = function (t) {
                              return (e.scale = t);
                            }),
                        },
                        null,
                        8,
                        ["modelValue"]
                      ),
                      Object(c["e"])("div", s, Object(c["m"])(e.scale), 1),
                    ]),
                    Object(c["e"])("li", null, [
                      m,
                      Object(c["e"])(
                        F,
                        {
                          modelValue: e.brightness,
                          "onUpdate:modelValue":
                            t[6] ||
                            (t[6] = function (t) {
                              return (e.brightness = t);
                            }),
                        },
                        null,
                        8,
                        ["modelValue"]
                      ),
                      Object(c["e"])("div", b, Object(c["m"])(e.brightness), 1),
                    ]),
                    Object(c["e"])("li", null, [
                      f,
                      Object(c["e"])(
                        "div",
                        {
                          onClick:
                            t[8] ||
                            (t[8] = function (t) {
                              return (e.showBg = !e.showBg);
                            }),
                          style: {
                            "margin-right": "12px",
                            cursor: "pointer",
                          },
                        },
                        [
                          Object(c["s"])(
                            Object(c["e"])(
                              "input",
                              {
                                type: "checkbox",
                                "onUpdate:modelValue":
                                  t[7] ||
                                  (t[7] = function (t) {
                                    return (e.showBg = t);
                                  }),
                                style: {
                                  margin: "0",
                                  "vertical-align": "middle",
                                  width: "18px",
                                  height: "18px",
                                  cursor: "pointer",
                                },
                              },
                              null,
                              512
                            ),
                            [[c["o"], e.showBg]]
                          ),
                          d,
                        ]
                      ),
                      Object(c["e"])(
                        "div",
                        {
                          onClick:
                            t[10] ||
                            (t[10] = function (t) {
                              return (e.showSecond = !e.showSecond);
                            }),
                          style: {
                            cursor: "pointer",
                          },
                        },
                        [
                          Object(c["s"])(
                            Object(c["e"])(
                              "input",
                              {
                                type: "checkbox",
                                "onUpdate:modelValue":
                                  t[9] ||
                                  (t[9] = function (t) {
                                    return (e.showSecond = t);
                                  }),
                                style: {
                                  margin: "0",
                                  "vertical-align": "middle",
                                  width: "18px",
                                  height: "18px",
                                  cursor: "pointer",
                                },
                              },
                              null,
                              512
                            ),
                            [[c["o"], e.showSecond]]
                          ),
                          p,
                        ]
                      ),
                    ]),
                    Object(c["e"])("li", null, [
                      h,
                      Object(c["e"])(
                        "button",
                        {
                          class: "timerBtn startBtn",
                          onClick:
                            t[11] ||
                            (t[11] = function () {
                              return (
                                C.stopWatch && C.stopWatch.apply(C, arguments)
                              );
                            }),
                        },
                        "开始"
                      ),
                      Object(c["e"])(
                        "button",
                        {
                          class: "timerBtn startBtn Cancel",
                          onClick:
                            t[12] ||
                            (t[12] = function () {
                              return (
                                C.cancelWatch &&
                                C.cancelWatch.apply(C, arguments)
                              );
                            }),
                        },
                        "取消"
                      ),
                    ]),
                    Object(c["e"])("li", null, [
                      g,
                      Object(c["e"])(
                        "button",
                        {
                          class: "timerBtn",
                          onClick:
                            t[13] ||
                            (t[13] = function (e) {
                              return C.getTimer(5);
                            }),
                        },
                        [v, O]
                      ),
                      Object(c["e"])(
                        "button",
                        {
                          class: "timerBtn",
                          onClick:
                            t[14] ||
                            (t[14] = function (e) {
                              return C.getTimer(10);
                            }),
                        },
                        [j, y]
                      ),
                      Object(c["e"])(
                        "button",
                        {
                          class: "timerBtn",
                          onClick:
                            t[15] ||
                            (t[15] = function (e) {
                              return C.getTimer(25);
                            }),
                        },
                        [w, S]
                      ),
                      Object(c["e"])(
                        "button",
                        {
                          class: "timerBtn",
                          onClick:
                            t[16] ||
                            (t[16] = function () {
                              return (
                                C.cancelTimer &&
                                C.cancelTimer.apply(C, arguments)
                              );
                            }),
                          style: {
                            "margin-right": "0px",
                          },
                        },
                        [T, _]
                      ),
                    ]),
                    Object(c["e"])("li", null, [
                      x,
                      Object(c["e"])(
                        N,
                        {
                          numRange: 24,
                          modelValue: e.my_h,
                          "onUpdate:modelValue":
                            t[17] ||
                            (t[17] = function (t) {
                              return (e.my_h = t);
                            }),
                        },
                        null,
                        8,
                        ["modelValue"]
                      ),
                      Object(c["e"])(
                        N,
                        {
                          numRange: 60,
                          modelValue: e.my_m,
                          "onUpdate:modelValue":
                            t[18] ||
                            (t[18] = function (t) {
                              return (e.my_m = t);
                            }),
                        },
                        null,
                        8,
                        ["modelValue"]
                      ),
                      Object(c["e"])(
                        N,
                        {
                          numRange: 60,
                          modelValue: e.my_s,
                          "onUpdate:modelValue":
                            t[19] ||
                            (t[19] = function (t) {
                              return (e.my_s = t);
                            }),
                        },
                        null,
                        8,
                        ["modelValue"]
                      ),
                      Object(c["e"])(
                        "button",
                        {
                          class: "timerBtn",
                          onClick:
                            t[20] ||
                            (t[20] = function (e) {
                              return C.getTimer(0);
                            }),
                          style: {
                            "margin-left": "4px",
                          },
                        },
                        "开始"
                      ),
                    ]),
                  ]),
                  k,
                ];
              }),
              _: 1,
            },
            8,
            ["onCloseSet"]
          ),
        ])
      );
    }
    var V = n("5530"),
      B = {
        class: "clock",
      };

    function M(e, t, n, i, o, l) {
      return (
        Object(c["g"])(),
        Object(c["c"])("div", B, [
          Object(c["e"])(
            "canvas",
            {
              id: n.cid,
              class: "clock_canva",
              width: "800",
              height: "800",
            },
            null,
            8,
            ["id"]
          ),
        ])
      );
    }
    var F = function (e, t, n, c) {
        var i = e / c,
          o = i * i;
        return t + (n - t) * o;
      },
      N = function (e, t, n, c) {
        var i = e / c,
          o = -i * i + 2 * i;
        return t + (n - t) * o;
      },
      H = function (e, t, n, c) {
        if (e < c / 2) return F(e, t, (t + n) / 2, c / 2);
        var i = e - c / 2,
          o = (t + n) / 2;
        return N(i, o, n, c / 2);
      },
      R = H,
      I = {
        props: {
          cid: String,
          msg: {
            default: "13",
          },
          bg: {
            default: !0,
          },
          ampm: {
            default: !1,
          },
        },
        setup: function (e) {
          var t = Object(c["h"])({
              r: 64,
              fontSize: 660,
              fontFamily: "Arial",
              flipping: !1,
              tempVal: "08",
              tempAp: "AM",
              ctx: null,
            }),
            n = function () {
              var t = {
                ap: "",
              };
              if (((t.num = e.msg), e.ampm)) {
                var n = parseInt(e.msg);
                n < 13
                  ? (t.ap = "AM")
                  : n < 24 && ((t.ap = "PM"), (t.num = n - 12));
              }
              return t;
            },
            i = function () {
              var c = document.querySelector("#" + e.cid);
              if (c.getContext) {
                var i = c.getContext("2d");
                (t.ctx = i),
                  console.log("init"),
                  i.translate(0, 400),
                  (i.textAlign = "center"),
                  (i.textBaseline = "middle"),
                  (i.font = "normal bold " + t.fontSize + "px " + t.fontFamily);
                var o = n(),
                  l = o.ap,
                  r = o.num;
                (t.tempAp = l), (t.tempVal = r), m(r, l, !0), m(r, l, !1);
              }
            },
            o = function (e) {
              var n = t.ctx,
                c = t.r;
              n.beginPath(),
                n.moveTo(0, 0),
                n.lineTo(800, 0),
                e
                  ? (n.lineTo(800, c - 400),
                    n.quadraticCurveTo(800, -400, 800 - c, -400),
                    n.lineTo(c, -400),
                    n.quadraticCurveTo(0, -400, 0, c - 400))
                  : (n.lineTo(800, 400 - c),
                    n.quadraticCurveTo(800, 400, 800 - c, 400),
                    n.lineTo(c, 400),
                    n.quadraticCurveTo(0, 400, 0, 400 - c)),
                n.clip();
            },
            l = function (e, t, n) {
              var c = e.createLinearGradient(0, -400, 0, 400);
              return c.addColorStop(0, t), c.addColorStop(1, n), c;
            },
            r = function () {
              var e = t.ctx;
              (e.fillStyle = l(e, "#161616", "#0c0c0c")),
                e.fillRect(0, -400, 800, 800);
            },
            a = function (e) {
              var n = t.ctx,
                c = 100,
                i = 264;
              n.save(),
                (n.font = "normal bold 80px " + t.fontFamily),
                "AM" === e
                  ? ((n.fillStyle = "#bbbbbb"), n.fillText(e, c, -i))
                  : ((n.fillStyle = "#b9b9b9"), n.fillText(e, c, i)),
                n.restore();
            },
            u = function (e) {
              var n = t.ctx;
              (n.fillStyle = l(n, "#bcbcbc", "#b8b8b8")), n.fillText(e, 400, 0);
            },
            s = function () {
              var e =
                  arguments.length > 0 && void 0 !== arguments[0]
                    ? arguments[0]
                    : 12,
                n = t.ctx;
              (n.fillStyle = "#000000"), n.fillRect(0, -e / 2, 800, e);
            },
            m = function (n, c) {
              var i =
                  !(arguments.length > 2 && void 0 !== arguments[2]) ||
                  arguments[2],
                l =
                  arguments.length > 3 && void 0 !== arguments[3]
                    ? arguments[3]
                    : 1,
                m = t.ctx;
              m.save(),
                m.scale(1, l),
                o(i),
                e.bg ? r() : m.clearRect(0, -400, 800, 800),
                e.ampm && a(c),
                u(n),
                s(),
                m.restore();
            },
            b = function () {
              if (!t.flipping) {
                t.flipping = !0;
                var e = new Date().getTime(),
                  c = 600,
                  i = n(),
                  o = i.ap,
                  l = i.num,
                  r = function n() {
                    var i = new Date().getTime(),
                      r = i - e;
                    if (r > c)
                      return (
                        (t.flipping = !1),
                        (t.tempVal = l),
                        (t.tempAp = o),
                        m(l, o),
                        void m(l, o, !1)
                      );
                    var a = !0,
                      u = Math.PI,
                      s = Math.sin((R(r, -90, 90, c) * u) / 180);
                    r < c / 2
                      ? (m(l, o), m(t.tempVal, t.tempAp, !0, -s))
                      : (a && ((a = !1), m(l, o)),
                        m(t.tempVal, t.tempAp, !1),
                        m(l, o, !1, s)),
                      requestAnimationFrame(n);
                  };
                r();
              }
            };
          Object(c["f"])(function () {
            i();
          }),
            Object(c["q"])(
              [
                function () {
                  return e.msg;
                },
                function () {
                  return e.ampm;
                },
              ],
              function () {
                b();
              }
            ),
            Object(c["q"])(
              function () {
                return e.bg;
              },
              function () {
                b();
              }
            );
        },
      };
    n("8486");
    I.render = M;
    var P = I,
      A = {
        class: "setbox",
      },
      D = Object(c["e"])(
        "div",
        {
          class: "pic_set",
        },
        null,
        -1
      );

    function q(e, t, n, i, o, l) {
      return (
        Object(c["g"])(),
        Object(c["c"])("div", A, [
          Object(c["e"])(
            "div",
            {
              class: "set-warp",
              onMouseleave:
                t[2] ||
                (t[2] = function () {
                  return i.hideSet && i.hideSet.apply(i, arguments);
                }),
            },
            [
              Object(c["e"])(
                "div",
                {
                  class: "setting",
                  onMouseenter:
                    t[1] ||
                    (t[1] = function (e) {
                      return (i.isShow = !0);
                    }),
                },
                [D],
                32
              ),
            ],
            32
          ),
          Object(c["s"])(
            Object(c["e"])(
              "div",
              {
                class: "set_item setLoad",
                ref: "setDom",
                onMouseleave:
                  t[3] ||
                  (t[3] = function () {
                    return i.hideSet && i.hideSet.apply(i, arguments);
                  }),
              },
              [Object(c["k"])(e.$slots, "default")],
              544
            ),
            [[c["p"], i.isShow]]
          ),
        ])
      );
    }
    var U = {
      setup: function (e, t) {
        var n = t.emit,
          i = Object(c["i"])(!1),
          o = Object(c["i"])(null),
          l = function () {
            (i.value = !1), n("closeSet");
          },
          r = function (e) {
            e.toElement && o.value !== e.toElement && l();
          };
        return (
          Object(c["f"])(function () {
            o.value.classList.remove("setLoad");
          }),
          {
            isShow: i,
            setDom: o,
            hideSet: r,
            hidesetF: l,
          }
        );
      },
    };
    n("b5a5");
    U.render = q;
    var W = U;

    function L(e, t, n, i, o, l) {
      return (
        Object(c["g"])(),
        Object(c["c"])(
          "div",
          {
            class: "slider",
            ref: "mySlider",
            style: {
              height: n.barHeight,
            },
            onMousedown:
              t[1] ||
              (t[1] = function () {
                return i.sliderHandle && i.sliderHandle.apply(i, arguments);
              }),
          },
          [
            Object(c["e"])(
              "div",
              {
                class: "bar-line-right",
                style: {
                  width: n.barHeight,
                  height: n.lineHeight,
                },
              },
              null,
              4
            ),
            Object(c["e"])(
              "div",
              {
                class: "bar-line",
                style: {
                  width: "calc(100% - " + n.barHeight + ")",
                  height: n.lineHeight,
                  "background-size": n.modelValue + "%",
                },
              },
              [
                Object(c["e"])(
                  "div",
                  {
                    class: "bar-handle",
                    style: {
                      width: n.barHeight,
                      height: n.barHeight,
                      left: n.modelValue + "%",
                    },
                  },
                  null,
                  4
                ),
              ],
              4
            ),
          ],
          36
        )
      );
    }
    n("a9e3"), n("ac1f"), n("466d");
    var E = {
      props: {
        modelValue: Number,
        barHeight: {
          default: "20px",
        },
        lineHeight: {
          default: "4px",
        },
      },
      setup: function (e, t) {
        var n = t.emit,
          i = Object(c["i"])(null),
          o = function (t) {
            var c = e.barHeight.match(/(\d+)/)[1];
            c = parseInt(c);
            var o = i.value,
              l = o.getBoundingClientRect().left,
              r = o.offsetWidth,
              a = function (e) {
                var t = e,
                  i = r - c;
                e < 0 ? (t = 0) : e > i && (t = i),
                  n("update:modelValue", parseInt((100 * t) / i));
              };
            a(t.pageX - l - c / 2),
              (document.onmousemove = function (e) {
                a(e.pageX - l - c / 2);
              }),
              (document.onmouseup = function () {
                (document.onmousemove = null), (document.onmouseup = null);
              });
          };
        return {
          sliderHandle: o,
          mySlider: i,
        };
      },
    };
    n("a8bf");
    E.render = L;
    var J = E,
      z = {
        class: "time-panel-box",
      },
      X = {
        class: "time-panel",
      },
      G = {
        class: "scroll-box",
        ref: "sb",
      },
      Y = {
        class: "panel-item",
      };

    function $(e, t, n, i, o, l) {
      return (
        Object(c["g"])(),
        Object(c["c"])("div", z, [
          Object(c["e"])("div", X, [
            Object(c["e"])(
              "div",
              G,
              [
                Object(c["e"])("ul", Y, [
                  (Object(c["g"])(!0),
                  Object(c["c"])(
                    c["a"],
                    null,
                    Object(c["j"])(e.temp, function (e, t) {
                      return (
                        Object(c["g"])(),
                        Object(c["c"])(
                          "li",
                          {
                            key: t,
                          },
                          Object(c["m"])(e),
                          1
                        )
                      );
                    }),
                    128
                  )),
                ]),
              ],
              512
            ),
            Object(c["e"])(
              "div",
              {
                class: "panel-up",
                onClick:
                  t[1] ||
                  (t[1] = function (e) {
                    return i.changeNum(-1);
                  }),
              },
              "︿"
            ),
            Object(c["e"])(
              "div",
              {
                class: "panel-down",
                onClick:
                  t[2] ||
                  (t[2] = function (e) {
                    return i.changeNum(1);
                  }),
              },
              "﹀"
            ),
          ]),
        ])
      );
    }
    var K = {
      props: {
        modelValue: Number,
        numRange: {
          default: 12,
        },
      },
      setup: function (e, t) {
        var n = t.emit,
          i = Object(c["h"])({
            val: 0,
            temp: [],
            sb: null,
            timeout: null,
          }),
          o = function () {
            for (var t = 0; t < e.numRange; t++) {
              var n = t > 9 ? t : "0" + t;
              i.temp.push(n);
            }
          };
        o();
        var l = function (e) {
            var t =
              arguments.length > 1 && void 0 !== arguments[1]
                ? arguments[1]
                : 300;
            return (
              (i.timeout = null),
              function () {
                var n = arguments,
                  c = this;
                clearTimeout(i.timeout),
                  (i.timeout = setTimeout(function () {
                    e.apply(c, n);
                  }, t));
              }
            );
          },
          r = function (e) {
            i.timeout && clearTimeout(i.timeout);
            for (
              var t = i.sb,
                c = t.scrollTop,
                o = 24,
                l = i.temp.length,
                r = l - 1;
              r >= 0;
              r--
            )
              if (c > o * r - o / 2) {
                var a = r + e;
                a < 0 && (a = 0),
                  a > l - 1 && (a = l - 1),
                  (t.scrollTop = o * a),
                  n("update:modelValue", a);
                break;
              }
          },
          a = l(function () {
            r(0);
          });
        return (
          Object(c["f"])(function () {
            (i.sb.scrollTop = 24 * e.modelValue),
              setTimeout(function () {
                i.sb.addEventListener("scroll", a);
              }, 0);
          }),
          Object(V["a"])(
            Object(V["a"])({}, Object(c["n"])(i)),
            {},
            {
              changeNum: r,
              comfirmNum: a,
            }
          )
        );
      },
    };
    n("834b");
    K.render = $;
    var Q = K,
      Z =
        (n("d3b7"),
        n("25f0"),
        function (e) {
          var t = e.toString();
          return t[1] ? e : "0" + t;
        }),
      ee = function () {
        var e = new Date(),
          t = e.getHours(),
          n = e.getMinutes(),
          c = e.getSeconds();
        return {
          h: t,
          m: n,
          s: c,
        };
      },
      te = {
        components: {
          clock: P,
          setbox: W,
          slider: J,
          timePicker: Q,
        },
        setup: function () {
          var e = Object(c["h"])({
              setRef: null,
              num_h: "花",
              num_m: "森",
              num_s: "酱",
              hourFormat: 0,
              scale: 100,
              brightness: 100,
              showBg: !0,
              showSecond: !0,
              timeMode: 0,
              tempTime: 0,
              stopTime: 0,
              watching: !0,
              my_h: 0,
              my_m: 0,
              my_s: 0,
              setShow: null,
            }),
            t = function (t) {
              return e.hourFormat < 2 ? t : Z(t);
            },
            n = function (t) {
              e.watching = !0;
              var n = 0;
              0 === t
                ? ((n = 1e3 * (3600 * e.my_h + 60 * e.my_m + e.my_s)),
                  console.log("t", n))
                : (n = 6e4 * t);
              var c = new Date().getTime();
              (e.tempTime = c + n), (e.timeMode = 1), e.setRef.hidesetF();
            },
            i = function () {
              if (e.watching) {
                var t = new Date().getTime(),
                  n = e.tempTime - t;
                if (n <= 0)
                  return {
                    h: "ok",
                    m: "ok",
                    s: "ok",
                  };
                n = parseInt(n / 1e3);
                var c = parseInt(n / 3600),
                  i = parseInt(n / 60) % 60,
                  o = n % 60;
                return {
                  h: c,
                  m: i,
                  s: o,
                };
              }
              return {
                h: e.num_h,
                m: e.num_m,
                s: e.num_s,
              };
            },
            o = function () {
              (e.timeMode = 0), e.setRef.hidesetF();
            },
            l = function () {
              (e.tempTime = new Date().getTime()),
                (e.watching = !0),
                (e.timeMode = 2),
                e.setRef.hidesetF();
            },
            r = function () {
              if (e.watching) {
                var t = new Date().getTime(),
                  n = t - e.tempTime;
                n = parseInt(n / 1e3);
                var c = parseInt(n / 3600),
                  i = parseInt(n / 60) % 60,
                  o = n % 60;
                return {
                  h: c,
                  m: i,
                  s: o,
                };
              }
              return {
                h: e.num_h,
                m: e.num_m,
                s: e.num_s,
              };
            },
            a = function () {
              (e.timeMode = 0), e.setRef.hidesetF();
            },
            u = function () {
              var t = document.getElementsByClassName("pic_set")[0];
              if (
                ((t.style.opacity = 1),
                e.setShow && clearTimeout(e.setShow),
                (e.setShow = setTimeout(function () {
                  t.style.opacity = "";
                }, 400)),
                e.watching)
              )
                (e.watching = !1), (e.stopTime = new Date().getTime());
              else {
                e.watching = !0;
                var n = new Date().getTime();
                e.tempTime = e.tempTime + n - e.stopTime;
              }
            };
          setInterval(function () {
            var n = {},
              c = e.timeMode;
            0 === c ? (n = ee()) : 1 === c ? (n = i()) : 2 === c && (n = r()),
              (e.num_h = t(n.h)),
              (e.num_m = Z(n.m)),
              (e.num_s = Z(n.s));
          }, 200);
          var s = function () {
              for (
                var t = [
                    "hourFormat",
                    "scale",
                    "brightness",
                    "showBg",
                    "showSecond",
                    "my_h",
                    "my_m",
                    "my_s",
                  ],
                  n = {},
                  c = 0,
                  i = t;
                c < i.length;
                c++
              ) {
                var o = i[c];
                n[o] = e[o];
              }
              var l = JSON.stringify(n);
              localStorage.info = l;
            },
            m = function () {
              if (localStorage.info) {
                var t = JSON.parse(localStorage.info);
                for (var n in t) e[n] = t[n];
              }
            };
          m(),
            Object(c["f"])(function () {
              document.onkeydown = function (e) {
                (32 !== e.keyCode && 13 !== e.keyCode) || u();
              };
            });
          var b = function () {
            console.log("ttt");
          };
          return Object(V["a"])(
            Object(V["a"])({}, Object(c["n"])(e)),
            {},
            {
              getTimer: n,
              cancelTimer: o,
              stopWatch: l,
              startStop: u,
              cancelWatch: a,
              saveSet: s,
              ttt: b,
            }
          );
        },
      };
    n("7767");
    te.render = C;
    var ne = te;
    (console.log = function () {}), Object(c["b"])(ne).mount("#app");
    var newItem = document.createElement("canvas");
    newItem.id = "canvas-club";
    newItem.style.position = "fixed";
    var list = document.getElementsByClassName("bg");
    list[0].insertBefore(newItem, list.childNodes);
    var modal = document.getElementById("canvas-club");
    var setitem = document.getElementsByClassName("set_item");
    window.onclick = function (event) {
      if (event.target == modal) {
        var clk = document.getElementsByClassName("Cancel");
        clk[0].click();
      }
    };
  },
  7767: function (e, t, n) {
    "use strict";
    n("a5d8");
  },
  "834b": function (e, t, n) {
    "use strict";
    n("29e8");
  },
  8486: function (e, t, n) {
    "use strict";
    n("2294");
  },
  a5d8: function (e, t, n) {},
  a8bf: function (e, t, n) {
    "use strict";
    n("e471");
  },
  b551: function (e, t, n) {},
  b5a5: function (e, t, n) {
    "use strict";
    n("b551");
  },
  e471: function (e, t, n) {},
});
