/*! game-api - v0.25.1 - 2015-09-29 */
(function(t) {
    "use strict";

    function e() {}

    function n(t) {
        if (t = t || {}, this.IS_MASTER = t.isMaster || !1, !this.IS_MASTER) throw Error("The DataStore can only be instantiated by the Master");
        this.dataStore = {}
    }

    function i(t, e) {
        t = t || {}, this.IS_MASTER = t.isMaster, this.IS_SLAVE = !this.IS_MASTER, this.IS_STANDALONE = t.isStandalone, this.messenger = t.messenger, this.moduleReady = e || !1, this.appTimer = null, this.appDelayMin = 1e4, this.appDelayMax = 24e4, this.appError = !1, this.appTimerDelay = this.appDelayMax, this.appToken = null, this.token = null
    }

    function a(t, e) {
        t = t || {}, this.IS_MASTER = t.isMaster, this.IS_SLAVE = !this.IS_MASTER, this.IS_STANDALONE = t.isStandalone, this.messenger = t.messenger, this.eventTracking = t.eventTracking, this.appToken = t.appToken, this.moduleReady = e || !1, this.isGamestate = !1, this.endpoint = null, this.spilStorageId = null, this.flushTimer = null, this.flushDelayMin = 500, this.flushDelayMax = 3e4, this.flushTimerDelay = this.flushDelayMin, this.gameState = {
            started: !1,
            userId: null,
            appId: null,
            dirtyKeys: []
        }
    }

    function s(t, e) {
        if (this.IS_MASTER = t && t.isMaster ? t.isMaster : !1, this.IS_SLAVE = !this.IS_MASTER, this.messenger = null, this.subscribers = {}, this.moduleReady = e ? e : !1, this.data = t.data || null, this.gameState = "resume", !t || !t.messenger) throw Error("No messenger passed to the Game module instance");
        this.messenger = t.messenger, window.addEventListener ? window.addEventListener("message", this._performAction.bind(this), !1) : window.attachEvent && window.attachEvent("onmessage", this._performAction.bind(this)), this.IS_MASTER && this.messenger.subscribe("gameapi.game.adjustHeight", this.adjustHeight, this)
    }

    function r(t, e) {
        t = t || {}, this.isMaster = t.isMaster, this.isStandalone = t.isStandalone, this.messenger = t.messenger, this.moduleReady = e ? e : !1, this.activeLanguage = "en"
    }

    function o(t, e) {
        t = t || {}, this.IS_MASTER = t.isMaster, this.IS_STANDALONE = t.isStandalone, this.messenger = t.messenger, this.eventTracking = t.eventTracking, this.moduleReady = e ? e : !1, this.isAvailable = !1, this.locale = "", this.loggedIn = !1
    }

    function l(t, e) {
        t = t || {}, this.IS_MASTER = t.isMaster, this.IS_STANDALONE = t.isStandalone, this.messenger = t.messenger, this.eventTracking = t.eventTracking, this.moduleReady = e ? e : !1, this.isAvailable = !1
    }

    function p(t, e) {
        t = t || {}, this.IS_MASTER = t.isMaster, this.IS_SLAVE = !this.IS_MASTER, this.moduleReady = e ? e : !1, this.messenger = t.messenger, this.data = t.data || null, this.eventTracking = t.eventTracking, this.initialHeight = t.initialHeight, this.appToken = t.appToken, this.state = {
            userId: null
        }, this._setupMasterEvent()
    }

    function u(t, e) {
        t = t || {}, this.IS_MASTER = t.isMaster, this.IS_SLAVE = !this.IS_MASTER, this.moduleReady = e ? e : !1, this.messenger = t.messenger, this.data = t.data || null, this.eventTracking = t.eventTracking, this.initialHeight = t.initialHeight, this._setupMasterEvent()
    }

    function c(t, e) {
        t = t || {}, this.isMaster = t.isMaster, this.isStandalone = t.isStandalone, this.messenger = t.messenger, this.moduleReady = e ? e : !1, this.timeoutAfter = 500, this.timeout = !1, this.adRequested = !1, this._callbacks = {
            pause: !1,
            resume: !1
        }
    }

    function d(t, e) {
        t = t || {}, this.IS_MASTER = t.isMaster, this.isStandalone = t.isStandalone, this.messenger = t.messenger, this.eventTracking = t.eventTracking, this.moduleReady = e ? e : !1, this.events = {
            GAME_START: "GAME_START",
            GAME_END: "GAME_END",
            GAME_PAUSE: "GAME_PAUSE",
            GAME_CONTINUE: "GAME_CONTINUE",
            GAME_MUTE: "GAME_MUTE",
            LEVEL_FAIL: "LEVEL_FAIL",
            LEVEL_COMPLETE: "LEVEL_COMPLETE"
        }, this._setupEvents()
    }

    function h(t, e) {
        t = t || {}, this.IS_MASTER = t.isMaster, this.IS_SLAVE = !this.IS_MASTER, this.IS_STANDALONE = t.isStandalone, this.data = t.data, this.messenger = t.messenger, this.moduleReady = e ? e : !1, this.gamePlayTracking = {
            started: !1,
            appid: null,
            host: null,
            timestamp: null
        }, this.timeInGameTracking = {
            started: !1,
            appid: null,
            timestamp: null
        }, this.isGamestate = !1
    }

    function g(t, e) {
        t = t || {}, this.IS_MASTER = t.isMaster, this.IS_SLAVE = !this.IS_MASTER, this.IS_STANDALONE = t.isStandalone, this.moduleReady = e ? e : !1, this.messenger = t.messenger, this.components = t.components, this.data = t.data || null
    }

    function f(t) {
        var e = "string" == typeof t ? m(t) : t;
        e && (this.type = e.type, this.callbackId = e.callbackId, this.data = e.data)
    }

    function m(t) {
        var e, n, i, a = !1,
            s = [];
        if ("string" == typeof t && (s = t.split("|"), "gameapi" === s[0])) {
            s.shift(), e = s.shift(), i = parseInt(s.shift(), 10), n = s.join("|");
            try {
                a = {
                    type: e,
                    callbackId: i,
                    data: "" !== n ? JSON.parse(n) : ""
                }
            } catch (r) {}
        }
        return a
    }

    function y(t) {
        t = t || {}, this.IS_MASTER = "boolean" == typeof t.isMaster ? t.isMaster : !1, this.IS_SLAVE = !this.IS_MASTER, this.api = t.api ? t.api : {}, this._targets = t.targets ? t.targets : [], this._callbacks = [], this._channels = [], this.IS_MASTER && t.dataStore && (this.dataStore = t.dataStore), this._setupEventListener()
    }

    function v(t, n, c, h, g) {
        window.outerHeight - window.innerHeight, this.version = "0.25.1", this.isReady = !1, this._setRole(), this.__ = {}, this.__.dataStore = this.IS_MASTER ? new t({
            isMaster: !0
        }) : null, this.__.messenger = new n({
            isMaster: this.IS_MASTER,
            api: this,
            targets: this._getTargets(),
            dataStore: this.__.dataStore
        }), this.__.components = new e;
        var f = this._addBasic({});
        this.__.EventTracking = new h(f, !1);
        var m = this._addComponents(f),
            y = this._addEventTracking(m),
            v = this._addInitialHeight(y);
        this.AppToken = new i(y, !1), this.GameState = new a(this._addAppToken(y), !1), this.Branding = new c(m, !1), this.GameBreak = new g(f, !1), this.Game = new s(f, !1), this.Award = new u(v, !1), this.User = new o(y, !1), this.Score = new p(this._addAppToken(v), !1), this.Friends = new l(y, !1), this.GameEvent = new d(y, !1), this.Localization = new r(y, !1)
    }
    "bind" in Function.prototype || (Function.prototype.bind = function(t) {
            var e = this;
            if (1 >= arguments.length) return function() {
                return e.apply(t, arguments)
            };
            var n = Array.prototype.slice.call(arguments, 1);
            return function() {
                return e.apply(t, 0 === arguments.length ? n : n.concat(Array.prototype.slice.call(arguments)))
            }
        }), "trim" in String.prototype || (String.prototype.trim = function() {
            return this.replace(/^\s+/, "").replace(/\s+$/, "")
        }), "indexOf" in Array.prototype || (Array.prototype.indexOf = function(t, e) {
            void 0 === e && (e = 0), 0 > e && (e += this.length), 0 > e && (e = 0);
            for (var n = this.length; n > e; e++)
                if (e in this && this[e] === t) return e;
            return -1
        }), "lastIndexOf" in Array.prototype || (Array.prototype.lastIndexOf = function(t, e) {
            for (void 0 === e && (e = this.length - 1), 0 > e && (e += this.length), e > this.length - 1 && (e = this.length - 1), e++; e-- > 0;)
                if (e in this && this[e] === t) return e;
            return -1
        }), "forEach" in Array.prototype || (Array.prototype.forEach = function(t, e) {
            for (var n = 0, i = this.length; i > n; n++) n in this && t.call(e, this[n], n, this)
        }), "map" in Array.prototype || (Array.prototype.map = function(t, e) {
            for (var n = Array(this.length), i = 0, a = this.length; a > i; i++) i in this && (n[i] = t.call(e, this[i], i, this));
            return n
        }), "filter" in Array.prototype || (Array.prototype.filter = function(t, e) {
            for (var n, i = [], a = 0, s = this.length; s > a; a++) a in this && t.call(e, n = this[a], a, this) && i.push(n);
            return i
        }), "every" in Array.prototype || (Array.prototype.every = function(t, e) {
            for (var n = 0, i = this.length; i > n; n++)
                if (n in this && !t.call(e, this[n], n, this)) return !1;
            return !0
        }), "some" in Array.prototype || (Array.prototype.some = function(t, e) {
            for (var n = 0, i = this.length; i > n; n++)
                if (n in this && t.call(e, this[n], n, this)) return !0;
            return !1
        }),
        function(t) {
            if ("function" == typeof bootstrap) bootstrap("promise", t);
            else if ("object" == typeof exports && "object" == typeof module) module.exports = t();
            else if ("function" == typeof define && define.amd) define(t);
            else if ("undefined" != typeof ses) {
                if (!ses.ok()) return;
                ses.makeQ = t
            } else {
                if ("undefined" == typeof window && "undefined" == typeof self) throw Error("This environment was not anticipated by Q. Please file a bug.");
                var e = "undefined" != typeof window ? window : self,
                    n = e.Q;
                e.Q = t(), e.Q.noConflict = function() {
                    return e.Q = n, this
                }
            }
        }(function() {
            function t(t) {
                return function() {
                    return Q.apply(t, arguments)
                }
            }

            function e(t) {
                return t === Object(t)
            }

            function n(t) {
                return "[object StopIteration]" === ne(t) || t instanceof J
            }

            function i(t, e) {
                if (H && e.stack && "object" == typeof t && null !== t && t.stack && -1 === t.stack.indexOf(ie)) {
                    for (var n = [], i = e; i; i = i.source) i.stack && n.unshift(i.stack);
                    n.unshift(t.stack);
                    var s = n.join("\n" + ie + "\n");
                    t.stack = a(s)
                }
            }

            function a(t) {
                for (var e = t.split("\n"), n = [], i = 0; e.length > i; ++i) {
                    var a = e[i];
                    o(a) || s(a) || !a || n.push(a)
                }
                return n.join("\n")
            }

            function s(t) {
                return -1 !== t.indexOf("(module.js:") || -1 !== t.indexOf("(node.js:")
            }

            function r(t) {
                var e = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(t);
                if (e) return [e[1], Number(e[2])];
                var n = /at ([^ ]+):(\d+):(?:\d+)$/.exec(t);
                if (n) return [n[1], Number(n[2])];
                var i = /.*@(.+):(\d+)$/.exec(t);
                return i ? [i[1], Number(i[2])] : void 0
            }

            function o(t) {
                var e = r(t);
                if (!e) return !1;
                var n = e[0],
                    i = e[1];
                return n === B && i >= V && le >= i
            }

            function l() {
                if (H) try {
                    throw Error()
                } catch (t) {
                    var e = t.stack.split("\n"),
                        n = e[0].indexOf("@") > 0 ? e[1] : e[2],
                        i = r(n);
                    if (!i) return;
                    return B = i[0], i[1]
                }
            }

            function p(t, e, n) {
                return function() {
                    return "undefined" != typeof console && "function" == typeof console.warn && console.warn(e + " is deprecated, use " + n + " instead.", Error("").stack), t.apply(t, arguments)
                }
            }

            function u(t) {
                return t instanceof g ? t : v(t) ? k(t) : I(t)
            }

            function c() {
                function t(t) {
                    e = t, s.source = t, K(n, function(e, n) {
                        u.nextTick(function() {
                            t.promiseDispatch.apply(t, n)
                        })
                    }, void 0), n = void 0, i = void 0
                }
                var e, n = [],
                    i = [],
                    a = Z(c.prototype),
                    s = Z(g.prototype);
                if (s.promiseDispatch = function(t, a, s) {
                    var r = z(arguments);
                    n ? (n.push(r), "when" === a && s[1] && i.push(s[1])) : u.nextTick(function() {
                        e.promiseDispatch.apply(e, r)
                    })
                }, s.valueOf = function() {
                    if (n) return s;
                    var t = m(e);
                    return y(t) && (e = t), t
                }, s.inspect = function() {
                    return e ? e.inspect() : {
                        state: "pending"
                    }
                }, u.longStackSupport && H) try {
                    throw Error()
                } catch (r) {
                    s.stack = r.stack.substring(r.stack.indexOf("\n") + 1)
                }
                return a.promise = s, a.resolve = function(n) {
                    e || t(u(n))
                }, a.fulfill = function(n) {
                    e || t(I(n))
                }, a.reject = function(n) {
                    e || t(E(n))
                }, a.notify = function(t) {
                    e || K(i, function(e, n) {
                        u.nextTick(function() {
                            n(t)
                        })
                    }, void 0)
                }, a
            }

            function d(t) {
                if ("function" != typeof t) throw new TypeError("resolver must be a function.");
                var e = c();
                try {
                    t(e.resolve, e.reject, e.notify)
                } catch (n) {
                    e.reject(n)
                }
                return e.promise
            }

            function h(t) {
                return d(function(e, n) {
                    for (var i = 0, a = t.length; a > i; i++) u(t[i]).then(e, n)
                })
            }

            function g(t, e, n) {
                void 0 === e && (e = function(t) {
                    return E(Error("Promise does not support operation: " + t))
                }), void 0 === n && (n = function() {
                    return {
                        state: "unknown"
                    }
                });
                var i = Z(g.prototype);
                if (i.promiseDispatch = function(n, a, s) {
                    var r;
                    try {
                        r = t[a] ? t[a].apply(i, s) : e.call(i, a, s)
                    } catch (o) {
                        r = E(o)
                    }
                    n && n(r)
                }, i.inspect = n, n) {
                    var a = n();
                    "rejected" === a.state && (i.exception = a.reason), i.valueOf = function() {
                        var t = n();
                        return "pending" === t.state || "rejected" === t.state ? i : t.value
                    }
                }
                return i
            }

            function f(t, e, n, i) {
                return u(t).then(e, n, i)
            }

            function m(t) {
                if (y(t)) {
                    var e = t.inspect();
                    if ("fulfilled" === e.state) return e.value
                }
                return t
            }

            function y(t) {
                return t instanceof g
            }

            function v(t) {
                return e(t) && "function" == typeof t.then
            }

            function S(t) {
                return y(t) && "pending" === t.inspect().state
            }

            function _(t) {
                return !y(t) || "fulfilled" === t.inspect().state
            }

            function A(t) {
                return y(t) && "rejected" === t.inspect().state
            }

            function T() {
                ae.length = 0, se.length = 0, oe || (oe = !0)
            }

            function b(t, e) {
                oe && ("object" == typeof process && "function" == typeof process.emit && u.nextTick.runAfter(function() {
                    -1 !== $(se, t) && (process.emit("unhandledRejection", e, t), re.push(t))
                }), se.push(t), e && e.stack !== void 0 ? ae.push(e.stack) : ae.push("(no stack) " + e))
            }

            function w(t) {
                if (oe) {
                    var e = $(se, t); - 1 !== e && ("object" == typeof process && "function" == typeof process.emit && u.nextTick.runAfter(function() {
                        var n = $(re, t); - 1 !== n && (process.emit("rejectionHandled", ae[e], t), re.splice(n, 1))
                    }), se.splice(e, 1), ae.splice(e, 1))
                }
            }

            function E(t) {
                var e = g({
                    when: function(e) {
                        return e && w(this), e ? e(t) : this
                    }
                }, function() {
                    return this
                }, function() {
                    return {
                        state: "rejected",
                        reason: t
                    }
                });
                return b(e, t), e
            }

            function I(t) {
                return g({
                    when: function() {
                        return t
                    },
                    get: function(e) {
                        return t[e]
                    },
                    set: function(e, n) {
                        t[e] = n
                    },
                    "delete": function(e) {
                        delete t[e]
                    },
                    post: function(e, n) {
                        return null === e || void 0 === e ? t.apply(void 0, n) : t[e].apply(t, n)
                    },
                    apply: function(e, n) {
                        return t.apply(e, n)
                    },
                    keys: function() {
                        return ee(t)
                    }
                }, void 0, function() {
                    return {
                        state: "fulfilled",
                        value: t
                    }
                })
            }

            function k(t) {
                var e = c();
                return u.nextTick(function() {
                    try {
                        t.then(e.resolve, e.reject, e.notify)
                    } catch (n) {
                        e.reject(n)
                    }
                }), e.promise
            }

            function R(t) {
                return g({
                    isDef: function() {}
                }, function(e, n) {
                    return N(t, e, n)
                }, function() {
                    return u(t).inspect()
                })
            }

            function M(t, e, n) {
                return u(t).spread(e, n)
            }

            function G(t) {
                return function() {
                    function e(t, e) {
                        var r;
                        if ("undefined" == typeof StopIteration) {
                            try {
                                r = i[t](e)
                            } catch (o) {
                                return E(o)
                            }
                            return r.done ? u(r.value) : f(r.value, a, s)
                        }
                        try {
                            r = i[t](e)
                        } catch (o) {
                            return n(o) ? u(o.value) : E(o)
                        }
                        return f(r, a, s)
                    }
                    var i = t.apply(this, arguments),
                        a = e.bind(e, "next"),
                        s = e.bind(e, "throw");
                    return a()
                }
            }

            function L(t) {
                u.done(u.async(t)())
            }

            function P(t) {
                throw new J(t)
            }

            function x(t) {
                return function() {
                    return M([this, O(arguments)], function(e, n) {
                        return t.apply(e, n)
                    })
                }
            }

            function N(t, e, n) {
                return u(t).dispatch(e, n)
            }

            function O(t) {
                return f(t, function(t) {
                    var e = 0,
                        n = c();
                    return K(t, function(i, a, s) {
                        var r;
                        y(a) && "fulfilled" === (r = a.inspect()).state ? t[s] = r.value : (++e, f(a, function(i) {
                            t[s] = i, 0 === --e && n.resolve(t)
                        }, n.reject, function(t) {
                            n.notify({
                                index: s,
                                value: t
                            })
                        }))
                    }, void 0), 0 === e && n.resolve(t), n.promise
                })
            }

            function D(t) {
                if (0 === t.length) return u.resolve();
                var e = u.defer(),
                    n = 0;
                return K(t, function(i, a, s) {
                    function r(t) {
                        e.resolve(t)
                    }

                    function o() {
                        n--, 0 === n && e.reject(Error("Can't get fulfillment value from any promise, all promises were rejected."))
                    }

                    function l(t) {
                        e.notify({
                            index: s,
                            value: t
                        })
                    }
                    var p = t[s];
                    n++, f(p, r, o, l)
                }, void 0), e.promise
            }

            function C(t) {
                return f(t, function(t) {
                    return t = Y(t, u), f(O(Y(t, function(t) {
                        return f(t, W, W)
                    })), function() {
                        return t
                    })
                })
            }

            function j(t) {
                return u(t).allSettled()
            }

            function U(t, e) {
                return u(t).then(void 0, void 0, e)
            }

            function F(t, e) {
                return u(t).nodeify(e)
            }
            var H = !1;
            try {
                throw Error()
            } catch (q) {
                H = !!q.stack
            }
            var B, J, V = l(),
                W = function() {},
                X = function() {
                    function t() {
                        for (var t, i; n.next;) n = n.next, t = n.task, n.task = void 0, i = n.domain, i && (n.domain = void 0, i.enter()), e(t, i);
                        for (; o.length;) t = o.pop(), e(t);
                        a = !1
                    }

                    function e(e, n) {
                        try {
                            e()
                        } catch (i) {
                            if (r) throw n && n.exit(), setTimeout(t, 0), n && n.enter(), i;
                            setTimeout(function() {
                                throw i
                            }, 0)
                        }
                        n && n.exit()
                    }
                    var n = {
                            task: void 0,
                            next: null
                        },
                        i = n,
                        a = !1,
                        s = void 0,
                        r = !1,
                        o = [];
                    if (X = function(t) {
                        i = i.next = {
                            task: t,
                            domain: r && process.domain,
                            next: null
                        }, a || (a = !0, s())
                    }, "object" == typeof process && "[object process]" == "" + process && process.nextTick) r = !0, s = function() {
                        process.nextTick(t)
                    };
                    else if ("function" == typeof setImmediate) s = "undefined" != typeof window ? setImmediate.bind(window, t) : function() {
                        setImmediate(t)
                    };
                    else if ("undefined" != typeof MessageChannel) {
                        var l = new MessageChannel;
                        l.port1.onmessage = function() {
                            s = p, l.port1.onmessage = t, t()
                        };
                        var p = function() {
                            l.port2.postMessage(0)
                        };
                        s = function() {
                            setTimeout(t, 0), p()
                        }
                    } else s = function() {
                        setTimeout(t, 0)
                    };
                    return X.runAfter = function(t) {
                        o.push(t), a || (a = !0, s())
                    }, X
                }(),
                Q = Function.call,
                z = t(Array.prototype.slice),
                K = t(Array.prototype.reduce || function(t, e) {
                    var n = 0,
                        i = this.length;
                    if (1 === arguments.length)
                        for (;;) {
                            if (n in this) {
                                e = this[n++];
                                break
                            }
                            if (++n >= i) throw new TypeError
                        }
                    for (; i > n; n++) n in this && (e = t(e, this[n], n));
                    return e
                }),
                $ = t(Array.prototype.indexOf || function(t) {
                    for (var e = 0; this.length > e; e++)
                        if (this[e] === t) return e;
                    return -1
                }),
                Y = t(Array.prototype.map || function(t, e) {
                    var n = this,
                        i = [];
                    return K(n, function(a, s, r) {
                        i.push(t.call(e, s, r, n))
                    }, void 0), i
                }),
                Z = Object.create || function(t) {
                    function e() {}
                    return e.prototype = t, new e
                },
                te = t(Object.prototype.hasOwnProperty),
                ee = Object.keys || function(t) {
                    var e = [];
                    for (var n in t) te(t, n) && e.push(n);
                    return e
                },
                ne = t(Object.prototype.toString);
            J = "undefined" != typeof ReturnValue ? ReturnValue : function(t) {
                this.value = t
            };
            var ie = "From previous event:";
            u.resolve = u, u.nextTick = X, u.longStackSupport = !1, "object" == typeof process && process && process.env && process.env.Q_DEBUG && (u.longStackSupport = !0), u.defer = c, c.prototype.makeNodeResolver = function() {
                var t = this;
                return function(e, n) {
                    e ? t.reject(e) : arguments.length > 2 ? t.resolve(z(arguments, 1)) : t.resolve(n)
                }
            }, u.Promise = d, u.promise = d, d.race = h, d.all = O, d.reject = E, d.resolve = u, u.passByCopy = function(t) {
                return t
            }, g.prototype.passByCopy = function() {
                return this
            }, u.join = function(t, e) {
                return u(t).join(e)
            }, g.prototype.join = function(t) {
                return u([this, t]).spread(function(t, e) {
                    if (t === e) return t;
                    throw Error("Can't join: not the same: " + t + " " + e)
                })
            }, u.race = h, g.prototype.race = function() {
                return this.then(u.race)
            }, u.makePromise = g, g.prototype.toString = function() {
                return "[object Promise]"
            }, g.prototype.then = function(t, e, n) {
                function a(e) {
                    try {
                        return "function" == typeof t ? t(e) : e
                    } catch (n) {
                        return E(n)
                    }
                }

                function s(t) {
                    if ("function" == typeof e) {
                        i(t, o);
                        try {
                            return e(t)
                        } catch (n) {
                            return E(n)
                        }
                    }
                    return E(t)
                }

                function r(t) {
                    return "function" == typeof n ? n(t) : t
                }
                var o = this,
                    l = c(),
                    p = !1;
                return u.nextTick(function() {
                    o.promiseDispatch(function(t) {
                        p || (p = !0, l.resolve(a(t)))
                    }, "when", [
                        function(t) {
                            p || (p = !0, l.resolve(s(t)))
                        }
                    ])
                }), o.promiseDispatch(void 0, "when", [void 0,
                    function(t) {
                        var e, n = !1;
                        try {
                            e = r(t)
                        } catch (i) {
                            if (n = !0, !u.onerror) throw i;
                            u.onerror(i)
                        }
                        n || l.notify(e)
                    }
                ]), l.promise
            }, u.tap = function(t, e) {
                return u(t).tap(e)
            }, g.prototype.tap = function(t) {
                return t = u(t), this.then(function(e) {
                    return t.fcall(e).thenResolve(e)
                })
            }, u.when = f, g.prototype.thenResolve = function(t) {
                return this.then(function() {
                    return t
                })
            }, u.thenResolve = function(t, e) {
                return u(t).thenResolve(e)
            }, g.prototype.thenReject = function(t) {
                return this.then(function() {
                    throw t
                })
            }, u.thenReject = function(t, e) {
                return u(t).thenReject(e)
            }, u.nearer = m, u.isPromise = y, u.isPromiseAlike = v, u.isPending = S, g.prototype.isPending = function() {
                return "pending" === this.inspect().state
            }, u.isFulfilled = _, g.prototype.isFulfilled = function() {
                return "fulfilled" === this.inspect().state
            }, u.isRejected = A, g.prototype.isRejected = function() {
                return "rejected" === this.inspect().state
            };
            var ae = [],
                se = [],
                re = [],
                oe = !0;
            u.resetUnhandledRejections = T, u.getUnhandledReasons = function() {
                return ae.slice()
            }, u.stopUnhandledRejectionTracking = function() {
                T(), oe = !1
            }, T(), u.reject = E, u.fulfill = I, u.master = R, u.spread = M, g.prototype.spread = function(t, e) {
                return this.all().then(function(e) {
                    return t.apply(void 0, e)
                }, e)
            }, u.async = G, u.spawn = L, u["return"] = P, u.promised = x, u.dispatch = N, g.prototype.dispatch = function(t, e) {
                var n = this,
                    i = c();
                return u.nextTick(function() {
                    n.promiseDispatch(i.resolve, t, e)
                }), i.promise
            }, u.get = function(t, e) {
                return u(t).dispatch("get", [e])
            }, g.prototype.get = function(t) {
                return this.dispatch("get", [t])
            }, u.set = function(t, e, n) {
                return u(t).dispatch("set", [e, n])
            }, g.prototype.set = function(t, e) {
                return this.dispatch("set", [t, e])
            }, u.del = u["delete"] = function(t, e) {
                return u(t).dispatch("delete", [e])
            }, g.prototype.del = g.prototype["delete"] = function(t) {
                return this.dispatch("delete", [t])
            }, u.mapply = u.post = function(t, e, n) {
                return u(t).dispatch("post", [e, n])
            }, g.prototype.mapply = g.prototype.post = function(t, e) {
                return this.dispatch("post", [t, e])
            }, u.send = u.mcall = u.invoke = function(t, e) {
                return u(t).dispatch("post", [e, z(arguments, 2)])
            }, g.prototype.send = g.prototype.mcall = g.prototype.invoke = function(t) {
                return this.dispatch("post", [t, z(arguments, 1)])
            }, u.fapply = function(t, e) {
                return u(t).dispatch("apply", [void 0, e])
            }, g.prototype.fapply = function(t) {
                return this.dispatch("apply", [void 0, t])
            }, u["try"] = u.fcall = function(t) {
                return u(t).dispatch("apply", [void 0, z(arguments, 1)])
            }, g.prototype.fcall = function() {
                return this.dispatch("apply", [void 0, z(arguments)])
            }, u.fbind = function(t) {
                var e = u(t),
                    n = z(arguments, 1);
                return function() {
                    return e.dispatch("apply", [this, n.concat(z(arguments))])
                }
            }, g.prototype.fbind = function() {
                var t = this,
                    e = z(arguments);
                return function() {
                    return t.dispatch("apply", [this, e.concat(z(arguments))])
                }
            }, u.keys = function(t) {
                return u(t).dispatch("keys", [])
            }, g.prototype.keys = function() {
                return this.dispatch("keys", [])
            }, u.all = O, g.prototype.all = function() {
                return O(this)
            }, u.any = D, g.prototype.any = function() {
                return D(this)
            }, u.allResolved = p(C, "allResolved", "allSettled"), g.prototype.allResolved = function() {
                return C(this)
            }, u.allSettled = j, g.prototype.allSettled = function() {
                return this.then(function(t) {
                    return O(Y(t, function(t) {
                        function e() {
                            return t.inspect()
                        }
                        return t = u(t), t.then(e, e)
                    }))
                })
            }, u.fail = u["catch"] = function(t, e) {
                return u(t).then(void 0, e)
            }, g.prototype.fail = g.prototype["catch"] = function(t) {
                return this.then(void 0, t)
            }, u.progress = U, g.prototype.progress = function(t) {
                return this.then(void 0, void 0, t)
            }, u.fin = u["finally"] = function(t, e) {
                return u(t)["finally"](e)
            }, g.prototype.fin = g.prototype["finally"] = function(t) {
                return t = u(t), this.then(function(e) {
                    return t.fcall().then(function() {
                        return e
                    })
                }, function(e) {
                    return t.fcall().then(function() {
                        throw e
                    })
                })
            }, u.done = function(t, e, n, i) {
                return u(t).done(e, n, i)
            }, g.prototype.done = function(t, e, n) {
                var a = function(t) {
                        u.nextTick(function() {
                            if (i(t, s), !u.onerror) throw t;
                            u.onerror(t)
                        })
                    },
                    s = t || e || n ? this.then(t, e, n) : this;
                "object" == typeof process && process && process.domain && (a = process.domain.bind(a)), s.then(void 0, a)
            }, u.timeout = function(t, e, n) {
                return u(t).timeout(e, n)
            }, g.prototype.timeout = function(t, e) {
                var n = c(),
                    i = setTimeout(function() {
                        e && "string" != typeof e || (e = Error(e || "Timed out after " + t + " ms"), e.code = "ETIMEDOUT"), n.reject(e)
                    }, t);
                return this.then(function(t) {
                    clearTimeout(i), n.resolve(t)
                }, function(t) {
                    clearTimeout(i), n.reject(t)
                }, n.notify), n.promise
            }, u.delay = function(t, e) {
                return void 0 === e && (e = t, t = void 0), u(t).delay(e)
            }, g.prototype.delay = function(t) {
                return this.then(function(e) {
                    var n = c();
                    return setTimeout(function() {
                        n.resolve(e)
                    }, t), n.promise
                })
            }, u.nfapply = function(t, e) {
                return u(t).nfapply(e)
            }, g.prototype.nfapply = function(t) {
                var e = c(),
                    n = z(t);
                return n.push(e.makeNodeResolver()), this.fapply(n).fail(e.reject), e.promise
            }, u.nfcall = function(t) {
                var e = z(arguments, 1);
                return u(t).nfapply(e)
            }, g.prototype.nfcall = function() {
                var t = z(arguments),
                    e = c();
                return t.push(e.makeNodeResolver()), this.fapply(t).fail(e.reject), e.promise
            }, u.nfbind = u.denodeify = function(t) {
                var e = z(arguments, 1);
                return function() {
                    var n = e.concat(z(arguments)),
                        i = c();
                    return n.push(i.makeNodeResolver()), u(t).fapply(n).fail(i.reject), i.promise
                }
            }, g.prototype.nfbind = g.prototype.denodeify = function() {
                var t = z(arguments);
                return t.unshift(this), u.denodeify.apply(void 0, t)
            }, u.nbind = function(t, e) {
                var n = z(arguments, 2);
                return function() {
                    function i() {
                        return t.apply(e, arguments)
                    }
                    var a = n.concat(z(arguments)),
                        s = c();
                    return a.push(s.makeNodeResolver()), u(i).fapply(a).fail(s.reject), s.promise
                }
            }, g.prototype.nbind = function() {
                var t = z(arguments, 0);
                return t.unshift(this), u.nbind.apply(void 0, t)
            }, u.nmapply = u.npost = function(t, e, n) {
                return u(t).npost(e, n)
            }, g.prototype.nmapply = g.prototype.npost = function(t, e) {
                var n = z(e || []),
                    i = c();
                return n.push(i.makeNodeResolver()), this.dispatch("post", [t, n]).fail(i.reject), i.promise
            }, u.nsend = u.nmcall = u.ninvoke = function(t, e) {
                var n = z(arguments, 2),
                    i = c();
                return n.push(i.makeNodeResolver()), u(t).dispatch("post", [e, n]).fail(i.reject), i.promise
            }, g.prototype.nsend = g.prototype.nmcall = g.prototype.ninvoke = function(t) {
                var e = z(arguments, 1),
                    n = c();
                return e.push(n.makeNodeResolver()), this.dispatch("post", [t, e]).fail(n.reject), n.promise
            }, u.nodeify = F, g.prototype.nodeify = function(t) {
                return t ? (this.then(function(e) {
                    u.nextTick(function() {
                        t(null, e)
                    })
                }, function(e) {
                    u.nextTick(function() {
                        t(e)
                    })
                }), void 0) : this
            }, u.noConflict = function() {
                throw Error("Q.noConflict only works when Q is used as a global")
            };
            var le = l();
            return u
        }),
        function(t) {
            var e = "Promise" in t && "cast" in t.Promise && "resolve" in t.Promise && "reject" in t.Promise && "all" in t.Promise && "race" in t.Promise && "spread" in t.Promise;
            e || (t.Promise = t.Q.promise, t.Promise.all = t.Q.all, t.Promise.timeout = t.Q.timeout, t.Q.stopUnhandledRejectionTracking())
        }(t !== void 0 ? t : this);
    var S = {
        timeout: 3e3
    };
    S.getGameConfig = function() {
        var e = t.Q.defer();
        return SpilGames({
            waiton: "game.info.loaded"
        }, ["JSLib"], function(t) {
            var n = t.get("current.game.integration.info");
            n ? e.resolve(n) : e.reject(Error("No data retrieved from JSLib"))
        }), e.promise.timeout(this.timeout)
    }, S.getBrandingConfig = function(e) {
        var n = t.Q.defer(),
            i = "./configs",
            a = e.portal.siteId,
            s = e.portal.channelId,
            r = e.portal.applicationId,
            o = "en-EN",
            l = [i, s, a, r].join("/");
        return navigator && "undefined" != typeof navigator && (navigator.languages !== void 0 && navigator.languages[0] !== void 0 ? o = navigator.languages[0] : navigator.userLanguage !== void 0 && (o = navigator.userLanguage)), l = l + "?locale=" + o, SpilGames(["Net", "JSLib"], function(t, e) {
            t.send({
                url: l,
                type: "GET",
                dataType: "JSON"
            }, function(t) {
                if (t && t.configar) window.postMessage(new f({
                    type: "success",
                    callbackId: null,
                    data: "log.configar.getBranding.success"
                }), "*"), n.resolve(t.configar);
                else {
                    var i = {};
                    try {
                        i = e.get("configar.data.cached") || i
                    } catch (a) {}
                    n.reject(i)
                }
            })
        }), n.promise.timeout(this.timeout)
    };
    var _ = {};
    _.argsToArray = function(t) {
        return t ? Array.prototype.slice.apply(t) : []
    }, _.isA10 = function() {
        return /4399.com/.test(window.location.host)
    }, _.disableKeys = function(t) {
        var e = t.keyCode;
        (8 === e || 9 === e || e >= 32 && 40 >= e || 46 === e) && t.preventDefault()
    }, _.trackGA = function() {
        try {
            if ("www8.agame.com" === window.location.host) {
                var t = function(t, e, n, i, a, s, r) {
                    t.GoogleAnalyticsObject = a, t[a] = t[a] || function() {
                        (t[a].q = t[a].q || []).push(arguments)
                    }, t[a].l = 1 * new Date, s = e.createElement(n), r = e.getElementsByTagName(n)[0], s.async = 1, s.src = i, r.parentNode.insertBefore(s, r)
                };
                t(window, document, "script", "./analytics.js", "ga"), ga("create", "UA-8223336-3", "auto"), ga("send", "pageview")
            }
        } catch (e) {}
    }, _.getRole = function() {
        var t = "function" == typeof window.SpilGames,
            e = window.self !== window.top,
            n = null;
        if (_.isA10()) return window.onkeydown = this.disableKeys, {
            IS_MASTER: !0,
            IS_SLAVE: !0,
            IS_STANDALONE: !0
        };
        if (t) {
            var i = document.getElementById("#iframegame");
            switch (i) {
                case "null":
                    n = {
                        IS_MASTER: !0,
                        IS_SLAVE: !0,
                        IS_STANDALONE: !1
                    };
                    break;
                default:
                    n = {
                        IS_MASTER: !0,
                        IS_SLAVE: !1,
                        IS_STANDALONE: !1
                    }
            }
        } else e ? (window.onkeydown = this.disableKeys, this.trackGA(), n = {
            IS_MASTER: !1,
            IS_SLAVE: !0,
            IS_STANDALONE: !1
        }) : (window.onkeydown = this.disableKeys, this.trackGA(), n = {
            IS_MASTER: !0,
            IS_SLAVE: !0,
            IS_STANDALONE: !0
        });
        return n
    }, _.callConfigar = function(t, e) {
        var n, i, a = t.site || 500,
            s = t.channel || 100,
            r = t.id || null;
        window.XDomainRequest ? (n = new XDomainRequest, n.onload = function() {
            e(200, n.responseText)
        }, n.onerror = function() {
            e(404, null)
        }, n.onprogress = function() {}) : window.XMLHttpRequest ? (n = new XMLHttpRequest, n.onreadystatechange = function() {
            4 === n.readyState && e(n.status, n.responseText)
        }) : window.ActiveXObject && (n = new ActiveXObject("Microsoft.XMLHTTP"), n.onreadystatechange = function() {
            4 === n.readyState && e(n.status, n.responseText)
        }), r && (i = ["./configs", s, a, r].join("/"), n.open("GET", i, !0), n.timeout = 3e3, n.ontimeout = function() {
            e(404, null)
        }, n.send())
    }, _.submitData = function(t, e, n) {
        // var i, a = t || "",
        //     s = e || {},
        //     r = n || function() {};
        // window.XDomainRequest ? (i = new XDomainRequest, i.onload = function() {
        //     r(200, i.responseText)
        // }, i.onerror = function() {
        //     r(404, null)
        // }, i.onprogress = function() {}, i.open("POST", a, !0)) : window.XMLHttpRequest ? (navigator.userAgent.match(/Trident\/7.0;.* rv:11/) ? i = this.getJSONP() : (i = new XMLHttpRequest, i.onreadystatechange = function() {
        //     4 === i.readyState && r(i.status, i.responseText)
        // }), i.open("POST", a, !0), i.setRequestHeader("Content-type", "application/x-www-form-urlencoded")) : window.ActiveXObject && (i = new ActiveXObject("Microsoft.XMLHTTP"), i.onreadystatechange = function() {
        //     4 === i.readyState && r(i.status, i.responseText)
        // }, i.open("POST", a, !0)), i.timeout = 3e3, i.ontimeout = function() {
        //     r(404, null)
        // }, i.send(JSON.stringify(s))
    }, _.getJSONP = function() {
        var t = "",
            e = "jsonpspilgames" + +new Date,
            n = {
                open: function(e, n) {
                    e = null, t = n
                },
                onreadystatechange: function() {},
                setRequestHeader: function() {},
                set: function(t, e) {
                    n.set[t] = e
                },
                send: function(i) {
                    var a = n.set.callback || 0,
                        s = n.set.data || 0;
                    (i || a || s) && (t += /\?/.test(t) ? "&" : "?", i && (t += s ? s + "=" + encodeURIComponent(i) : i, a && (t += "&")), a && (t += a + "=" + e));
                    var r = document.createElement("script");
                    r.src = t, document.getElementsByTagName("head")[0].appendChild(r)
                }
            };
        return window[e] = function() {
            n.onreadystatechange.apply(this, arguments)
        }, n
    }, _.xdr = function(t, e) {
        var n, i, a = t.url || "",
            s = (t.type || "GET").toUpperCase(),
            r = void 0 !== t.data ? t.data : {},
            o = t.headers || {},
            l = function() {
                e({
                    isError: !0
                })
            },
            p = void 0 !== t.async ? t.async : !0;
        if (XMLHttpRequest) {
            if (n = new XMLHttpRequest, "withCredentials" in n) {
                n.open(s, a, p), n.onerror = l, n.onreadystatechange = function() {
                    4 === n.readyState && (n.status >= 200 && 400 > n.status ? e({
                        data: n.responseText,
                        status: n.status
                    }) : e({
                        isError: !0,
                        status: n.status
                    }))
                };
                for (i in o) o.hasOwnProperty(i) && n.setRequestHeader(i, o[i]);
                n.send(r)
            }
        } else if (XDomainRequest) {
            n = new XDomainRequest, n.open(s, a), n.onerror = l, n.onload = function() {
                e(n.responseText)
            };
            for (i in o) o.hasOwnProperty(i) && n.setRequestHeader(i, o[i]);
            n.send(r)
        } else e({
            isError: !0,
            message: "CORS not supported"
        })
    }, _.log = function() {
        if (window.console && window.console.log) {
            var t = Array.prototype.slice.call(arguments);
            console.log.apply(console, t)
        }
    }, _.addToken = function(t, e) {
        return t && (e.auth = {
            token: t
        }), e
    }, _.getServiceEndpoint = function(t) {
        return "stg" === t ? "https://api-stg.spilgames.com" : "https://api.spilgames.com"
    }, _.isWrapped = function() {
        return void 0 !== (window.PhoneGap || window.cordova || window.Cordova)
    }, _.isArray = Array.isArray || function(t) {
        return "[object Array]" === Object.prototype.toString.call(t)
    }, _._getQueryString = function() {
        return window.location.search
    }, _._getPortalHost = function() {
        return window && window.location && window.location.hostname ? window.location.hostname : "unknown"
    }, _.validateSchema = function(t, e) {
        for (var n in e)
            if (e.hasOwnProperty(n)) {
                if (!t.hasOwnProperty(n)) return {
                    error: "Wrong argument passed: " + n
                };
                if (t.hasOwnProperty(n)) {
                    var i = "object" == typeof t[n] ? t[n].type : t[n];
                    if (e[n].constructor.name !== i) return {
                        error: "Wrong value type for " + n + ": expected " + t[n] + ", got " + e[n].constructor.name
                    };
                    var a = t[n] && t[n].values || [];
                    if (-1 === a.indexOf(e[n])) return {
                        error: "Wrong value for " + n + ": expected " + a.join(" or ") + ", got " + e[n]
                    }
                }
            }
        return {
            error: !1
        }
    };
    var A = {};
    A.getGameConfig = function() {
        return S.getGameConfig()["catch"](function() {
            return A.getLocalConfig()
        })
    }, A.getBrandingConfig = function(t) {
        return new Promise(function(e) {
            return S.getBrandingConfig(t).then(e, function(t) {
                e(t), window.postMessage(new f({
                    type: "warning",
                    callbackId: null,
                    data: "log.configar.getBranding.failure"
                }), "*")
            })
        })
    }, A.getLocalConfig = function(t) {
        t = t && Object.keys(t).length ? t : {
            portal: {},
            game: {},
            branding: {},
            user: {},
            localization: {}
        };
        var e = {
            isLocal: t.isLocal || !1,
            game: {
                applicationId: t.portal.applicationId || "0",
                contentarId: t.portal.contentarId || "0",
                info: t.game.info || {},
                settings: t.game.objectSettings || {},
                properties: t.game.properties || {},
                features: {
                    achievements: t.game.achievements || !1,
                    gameSidePanel: t.game.gameSidePanel || !1,
                    highscores: t.game.highscores || !1,
                    recommendedGames: t.game.recommendedGames || !1
                }
            },
            user: {
                authenticated: t.user.authenticated || !1,
                username: t.user.username || "",
                appToken: t.user.appToken || "",
                userId: t.user.userId || "",
                token: t.user.token || ""
            },
            portal: {
                host: _._getPortalHost(),
                siteId: t.portal.siteId || 0,
                channelId: t.portal.channelId || 0,
                applicationId: t.portal.applicationId || "0",
                gamestate: t.portal.gamestate || !1,
                env: "stg" === t.portal.env ? "stg" : "prd",
                spilStorageId: t.portal.spilStorageId || ""
            },
            branding: t.branding || {},
            localization: t.localization || {}
        };
        return e.branding.logo = e.branding.logo || {}, e.branding.logo.url = e.branding.logo.url || !1, e.branding.logo.image = e.branding.logo.image || !1, e
    }, A.configFromData = function(t) {
        var e = {
            game: {
                applicationId: t.id
            },
            user: {
                userId: t.userid ? t.userid : void 0,
                appToken: t.appToken ? t.appToken : void 0
            },
            portal: {
                applicationId: t.id,
                siteId: t.site ? t.site : 187,
                channelId: t.channel ? t.channel : 100,
                gamestate: t.gamestate ? t.gamestate : !1,
                env: "stg" === t.env ? "stg" : "prd",
                spilStorageId: t.spilStorageId
            }
        };
        return e
    }, A.setupStandaloneMode = function(t, e) {
        var n = {},
            i = {
                configar: {
                    branding: {
                        main: {
                            label: "main",
                            image: "./img/logo_A10_202x50.png",
                            url: "http://www.a10.com",
                            style: "",
                            width: "202",
                            height: "50",
                            mime: "image/png",
                            type: "png",
                            handler: "newTab",
                            blacklisted: !0
                        },
                        logo: {
                            label: "logo",
                            image: "./img/logo_A10_202x50.png",
                            url: "http://www.a10.com",
                            style: "",
                            width: "202",
                            height: "50",
                            mime: "image/png",
                            type: "png",
                            handler: "newTab",
                            blacklisted: !1
                        },
                        more_games: {
                            label: "more_games",
                            image: null,
                            url: "http://www.a10.com",
                            style: "",
                            width: null,
                            height: null,
                            mime: null,
                            type: null,
                            handler: "newTab",
                            blacklisted: !1
                        },
                        splash_screen: {
                            label: "splash_screen",
                            image: "place_holder_string",
                            url: "http://www.a10.com",
                            style: "",
                            width: "0",
                            height: "0",
                            mime: "image/png",
                            type: "png",
                            handler: "newTab",
                            blacklisted: !1
                        }
                    }
                }
            };
        n.JSLib = {
            memory: {},
            _channels: {},
            get: function(t) {
                return this.memory[t] ? this.memory[t] : !1
            },
            set: function(t, e) {
                return this.memory[t] = e, e
            },
            publish: function(t, e) {
                this._channels[t] && this._channels[t].forEach(function(t) {
                    try {
                        t.fn.call(this, e)
                    } catch (n) {}
                })
            },
            subscribe: function(t, e) {
                if ("function" != typeof e) throw Error("Callback has to be a function");
                if ("string" != typeof t) throw Error("Channel name has to be a string");
                this._channels[t] || (this._channels[t] = []), this._channels[t].push({
                    fn: e
                })
            }
        }, n.Net = {
            send: function(t, e) {
                e.call(this, {})
            }
        }, window.SpilGamesBootstrap = [], window.SpilGames = function() {
            var t = arguments;
            if (t[0] && "string" == typeof t[0]) n.JSLib.publish(t[0], t[1] || null);
            else if (t[0] && t[0] instanceof Array) {
                var e, i, a = [];
                for (e = 0, i = t[0].length; i > e; e++) a.push(n[t[0][e]]);
                t[1].apply(this, a)
            }
        }, t && t.id ? _.callConfigar(t, function(n, a) {
            if (200 === n && "string" == typeof a && JSON.parse(a)) {
                var s = JSON.parse(a),
                    r = A.configFromData(t);
                r.branding = s.configar && s.configar.branding ? s.configar.branding : i.configar.branding, e.call(this, r)
            } else e.call(this, {
                isLocal: !0,
                branding: i.configar.branding
            })
        }) : e.call(this, {
            isLocal: !0,
            branding: i.configar.branding
        })
    }, A.getCachedConfig = function() {}, e.prototype.newTab = function(t) {
//        var e = window.navigator.userAgent.toLowerCase().match(/android.*applewebkit\/([\d.]+)/),
//            n = e && 537 > e[1],
//            i = n ? "_self" : "_blank",
//            a = t.url,
//            s = window.open(a, i);
//        return s && s.focus(), s
    }, e.prototype.moreGames = function(t) {
        var e = t.brandName || "a10";
        t.isStandalone ? this.newTab(t) : t.messenger && t.messenger.post && t.messenger.post("game.moregames", {
            branding: e
        })
    }, e.prototype.displayOnTop = function(t) {
        if (t === void 0 || t.url === void 0 || "string" != typeof t.url || t.action === void 0 || "function" != typeof t.action) return t.callback !== void 0 || "function" == typeof t.callback ? (t.callback(), void 0) : void 0;
        var e = document.createElement("div"),
            n = t.url,
            i = t.action,
            a = t.callback;
        e.setAttribute("id", "spilgames-splash-screen-sample"), document.body.appendChild(e);
        var s = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
            r = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        return e.style.left = "0", e.style.top = "0", e.style.width = s + "px", e.style.height = r + "px", e.style.position = "absolute", e.style.zIndex = "10000", e.onclick = i, n && (e.style.background = "url('" + n + "') center center no-repeat #FFF"), window.setTimeout(function() {
            var t = document.getElementById("spilgames-splash-screen-sample");
            t.parentNode.removeChild(t), a && a()
        }, 2e3), e
    }, n.prototype.get = function(t) {
        for (var e = this.dataStore, n = t.split("."), i = n.length, a = 0; i - 1 > a; a++) {
            if (!e[n[a]]) return null;
            e = e[n[a]]
        }
        return e[n[i - 1]] || null
    }, n.prototype.put = function(t, e) {
        for (var n = this.dataStore, i = t.split("."), a = i.length, s = 0; a - 1 > s; s++) {
            var r = i[s];
            n[r] || (n[r] = {}), n = n[r]
        }
        n[i[a - 1]] = e
    }, n.prototype.set = function(t, e) {
        this.put(t, e);
        var n = Date.parse(new Date);
        return this.notify({
            type: "new",
            key: t,
            current: e,
            previous: null,
            timestamp: n
        }), e
    }, n.prototype.update = function(t, e) {
        var n, i, a = null;
        return this.get(t) ? (n = "update", a = this.get(t)) : n = "new", this.put(t, e), i = Date.parse(new Date), this.notify({
            type: n,
            key: t,
            current: e,
            previous: a,
            timestamp: i
        }), e
    }, n.prototype.remove = function(t) {
        if (this.get(t)) {
            var e, n = this.get(t);
            return this.put(t, null), e = Date.parse(new Date), this.notify({
                type: "remove",
                key: t,
                current: null,
                previous: n,
                timestamp: e
            }), !0
        }
        return !1
    }, n.prototype._setCache = function(t) {
        this.dataStore = t
    }, n.prototype._getCache = function() {
        return this.dataStore
    }, n.prototype.notify = function(t) {
        if (this.IS_MASTER) {
            var e = new f({
                type: "datachange",
                callbackId: null,
                data: t
            }).encode();
            return window.postMessage(e, "*"), e
        }
    }, i.prototype.init = function(t) {
        t = t || {}, this.data = t.data || this.data, this.data && this.data.game && this.data.user && (this.appId = this.data.game.applicationId || null, this.appToken = this.data.user.appToken || null, this.token = this.data.user.token || null), this._setupEvents(), this.appToken || this._getAppToken(), (this.IS_SLAVE || this.IS_STANDALONE || _.isWrapped()) && this._scheduleRefresh()
    }, i.prototype.getAppToken = function() {
        return this.appToken
    }, i.prototype._setupEvents = function() {
        this.IS_MASTER ? this.messenger.subscribe("gameapi.apptoken.getAppToken", this._getAppToken, this) : this.messenger.subscribe("gameapi.apptoken.getAppTokenResponse", this._getAppTokenResponse, this)
    }, i.prototype._retryAppToken = function(t) {
        (t || this.appTimerDelay !== this.appDelayMax) && (t && !this.appError && (this.appTimerDelay = this.appDelayMin, this.appError = !0), this._unschedule(), t ? this._increaseDelay() : this._resetDelay(), this._scheduleRefresh())
    }, i.prototype._scheduleRefresh = function() {
        var t = this;
        null === this.appTimer && (this.appTimer = setInterval(function() {
            t._getAppToken()
        }, this.appTimerDelay))
    }, i.prototype._unschedule = function() {
        this.appTimer && clearTimeout(this.appTimer), this.appTimer = null
    }, i.prototype._increaseDelay = function() {
        this.appTimerDelay = Math.min(2 * this.appTimerDelay, this.appDelayMax)
    }, i.prototype._resetDelay = function() {
        this.appTimerDelay = this.appDelayMax
    }, i.prototype._getAppToken = function() {
        var t = this.messenger,
            e = this;
        if (!this.moduleReady) throw Error("This method cannot be called before the API is loaded");
        this.IS_MASTER || this.messenger._postMessage({}, void 0, "gameapi.apptoken.getAppToken"), this.IS_MASTER && ("function" == typeof SpilGames ? SpilGames("api.account.getApplicationToken", _.addToken(this.token, {
            cache: !1,
            applicationId: this.appId
        }), function(n) {
            n.error || !n.appAuth.token ? t._postMessage({}, void 0, "gameapi.apptoken.getAppTokenResponse") : (e.appToken = n.appAuth.token, t._postMessage({
                appToken: n.appAuth.token,
                level: n.level
            }, void 0, "gameapi.apptoken.getAppTokenResponse"))
        }) : t._postMessage({}, void 0, "gameapi.apptoken.getAppTokenResponse"))
    }, i.prototype._getAppTokenResponse = function(t) {
        t.appToken ? (this.appToken = t.appToken, this._retryAppToken(!1)) : this._retryAppToken(!0)
    }, a.prototype.init = function(t) {
        t = t || {}, this.data = t.data || this.data, this.data && this.data.game && this.data.user && this.data.portal && (this.gameState.appId = this.data.game.applicationId || null, this.gameState.userId = this.data.user.userId || null, this.isGamestate = this.data.portal.gamestate || !1, this.endpoint = _.getServiceEndpoint(this.data.portal.env), this.spilStorageId = this.data.portal.spilStorageId), this.isGamestate && (this.IS_SLAVE || this.IS_STANDALONE || _.isWrapped()) && (this.listenStorageEvents(), this.preloadGameState())
    }, a.prototype.listenStorageEvents = function() {
        var t = function(t) {
            this.onStorageEvent(t)
        }.bind(this);
        window.addEventListener("storage", t, !1)
    }, a.prototype.flagDirtyKey = function(t) {
        -1 === this.gameState.dirtyKeys.indexOf(t) && (this.gameState.dirtyKeys.push(t), this.scheduleSyncState())
    }, a.prototype.unschedule = function() {
        this.flushTimer && clearTimeout(this.flushTimer), this.flushTimer = null
    }, a.prototype.scheduleSyncState = function() {
        var t = this;
        null === this.flushTimer && (this.flushTimer = setInterval(function() {
            t.syncState()
        }, this.flushTimerDelay))
    }, a.prototype.increaseDelaySyncState = function() {
        this.flushTimerDelay = Math.min(2 * this.flushTimerDelay, this.flushDelayMax)
    }, a.prototype.resetDelaySyncState = function() {
        this.flushTimerDelay = this.flushDelayMin
    }, a.prototype.onStorageEvent = function(t) {
        t && t.url && t.url.indexOf("spilStorageId=" + this.spilStorageId) > 0 && this.flagDirtyKey(t.key)
    }, a.prototype.preloadGameState = function() {
        var t = {
            url: this.endpoint + "/v1/gamestate/" + this.gameState.userId + "/" + this.gameState.appId,
            type: "GET",
            dataType: "JSON",
            headers: {
                "x-auth-token": this.appToken.getAppToken()
            }
        };
        _.xdr(t, function(t) {
            if (t.isError) _.log("GameAPIGameState failed preloading: " + t.status);
            else {
                var e = JSON.parse(t.data);
                if (e && e.gamestate) {
                    var n = e.gamestate,
                        i = 0,
                        a = null;
                    for (a in n) n.hasOwnProperty(a) && (window.localStorage[a] = n[a], i++);
                    _.log("GameAPIGameState preloaded: " + i + " keys")
                }
            }
        })
    }, a.prototype.retrySyncState = function(t) {
        _.log(t), this.increaseDelaySyncState(), this.scheduleSyncState()
    }, a.prototype.syncState = function() {
        if (this.unschedule(), !this.gameState.appId) return this.retrySyncState("GameAPIGameState.prototype.syncStat no appId");
        if (!this.gameState.userId) return this.retrySyncState("GameAPIGameState.prototype.syncState no userId");
        for (var t, e = this.gameState.appId, n = this.gameState.userId, i = this.gameState.dirtyKeys, a = {
            set: {},
            remove: []
        }, s = 0, r = this, o = 0; i.length > o; o++) t = window.localStorage[i[o]], void 0 === t ? a.remove.push(i[o]) : (a.set[i[o]] = t, s = Math.max(t.length, s));
        if (i.length > 0) {
            var l = {
                url: this.endpoint + "/v1/gamestate/" + n + "/" + e,
                type: "POST",
                data: JSON.stringify(a),
                async: !0,
                headers: {
                    "x-auth-token": this.appToken.getAppToken()
                }
            };
            _.xdr(l, function(t) {
                t.isError ? r.retrySyncState("GameAPIGameState error syncing state") : (_.log("GameAPIGameState synced " + i.length + " keys"), r.resetDelaySyncState(), r.gameState.dirtyKeys = [])
            });
            var p = {
                numkeys: i.length,
                maxdatalength: s,
                userid: n
            };
            this.eventTracking.trackGameAPIEvent("gameState", p)
        }
        return !0
    }, s.prototype.init = function(t) {
        this.data = t.data || null
    }, s.prototype._performAction = function(t) {
        var e = new f(t.data || {}),
            n = this.messenger,
            i = this.subscribers || {};
        if (e && e.type && e.data) switch (e.type) {
            case "gameEvent":
                e.data[0] && i[e.data[0]] && i[e.data[0]].length > 0 ? i[e.data[0]].forEach(function(t) {
                    t.call(this), n._postMessage([e.data[0], {
                            origin: "slave"
                        },
                        null
                    ], null, "gameState")
                }) : e.data[0] && e.data[1] && "slave" === e.data[1].origin && "function" == typeof SWFtoJS && SWFtoJS({
                    call: e.data[0],
                    params: {}
                });
                break;
            case "gameState":
                e.data[0] && e.data[1] && "slave" === e.data[1].origin && (this.gameState = e.data[0])
        }
    }, s.prototype.on = function(t, e) {
        this.IS_SLAVE && (this.subscribers[t] || (this.subscribers[t] = []), this.subscribers[t].push(e))
    }, s.prototype.emit = function(t) {
        if (!this.IS_MASTER) throw Error("Only the master environment can emit game events");
        if (!this.moduleReady) throw Error("This method cannot be called before the API is loaded");
        if (t === this.gameState) throw Error("The game is already in state: `" + t + "`");
        this.messenger._postMessage([t, {
                origin: "master"
            },
            null
        ], null, "gameEvent")
    }, s.prototype.isSiteLock = function() {
        var t = !0;
        if (!this.moduleReady) throw Error("This method cannot be called before the API is loaded");
        return this.data && this.data.portal && this.data.portal.siteId && 500 > this.data.portal.siteId && (t = !1), t
    }, s.prototype.adjustHeight = function(t) {
        if (!this.moduleReady) throw Error("This method cannot be called before the API is loaded");
        this.IS_MASTER ? "function" == typeof SpilGames && SpilGames.Events !== void 0 && "function" == typeof SpilGames.Events.publish && SpilGames.Events.publish("portal.adjustheight", {
            height: t,
            onsuccess: function() {}
        }) : (this.messenger._postMessage(t, void 0, "gameapi.game.adjustHeight"), this.messenger._postMessage(["log.gameapi.game.adjustHeight", {
                origin: "slave",
                height: t
            },
            null
        ], null, "log"))
    }, r.prototype.init = function(t) {
        t = t || {}, this.data = t.data || this.data, this._setupEvents()
    }, r.prototype._setupEvents = function() {
        this.isMaster || this.messenger.subscribe("gameapi.locale.change", this._localeChange, this)
    }, r.prototype._localeChange = function(t) {
        this.activeLanguage = t
    }, r.prototype.changeLocale = function(t) {
        this.isMaster && this.messenger._postMessage(t, void 0, "gameapi.locale.change")
    }, r.prototype.getLocalizedText = function(t, e) {
        if (!this.moduleReady) throw Error("This method cannot be called before the API is loaded");
        var n = t;
        return this.data && this.data.localization[this.activeLanguage] && this.data.localization[this.activeLanguage][t] && this.data.localization[this.activeLanguage][t].id && this.data.localization[this.activeLanguage][t].id === e && (n = this.data.localization[this.activeLanguage][t].text), n
    }, o.prototype.init = function(t) {
        this._setLocale(t), this._setupEvents(), t && t.data && t.data.portal && t.data.portal.siteId && 500 > t.data.portal.siteId && "0" !== t.data.portal.siteId && (this.isAvailable = !0)
    }, o.prototype._setupEvents = function() {
        this.IS_MASTER ? (this.messenger.subscribe("gameapi.user.forceAuthentication", this.forceAuthentication, this), this.messenger.subscribe("gameapi.user.getUser", this.getUser, this), this.messenger.subscribe("gameapi.user.login", this.login, this)) : (this.messenger.subscribe("gameapi.user.loginResponse", this._loginResponse, this), this.messenger.subscribe("gameapi.user.getUserResponse", this._getUserResponse, this))
    }, o.prototype.login = function(t, e) {
        var n = this.messenger;
        if (t = t || {}, this.logincallback = e, this.IS_MASTER) SpilGames("api.auth.getToken", {
            context: {
                channelid: 100,
                siteid: 2
            }
        }, function(e) {
            SpilGames("api.auth.login", {
                auth: {
                    token: e.auth.token
                },
                login: t.username,
                password: t.password
            }, function(t) {
                n._postMessage(t, void 0, "gameapi.user.loginResponse")
            })
        });
        else {
            var i = {};
            i.username = t.username || "", i.password = t.password || "", n._postMessage(i, void 0, "gameapi.user.login")
        }
    }, o.prototype._loginResponse = function(t) {
        var e = {};
        e.success = !1, t.auth && t.auth.token && (this.loggedIn = !0, this.token = t.auth.token, e.success = !0), this.logincallback(e), this.logincallback = function() {}
    }, o.prototype.forceAuthentication = function() {
        if (!this.moduleReady) throw Error("This method cannot be called before the API is loaded");
        this.IS_MASTER ? "function" == typeof SpilGames && SpilGames.Portal !== void 0 && "function" == typeof SpilGames.Portal.forceAuthentication && SpilGames.Portal.forceAuthentication({
            onsuccess: function() {}
        }) : (this.messenger._postMessage({}, void 0, "gameapi.user.forceAuthentication"), this.messenger._postMessage(["log.gameapi.user.forceAuthentication", {
                origin: "slave"
            },
            null
        ], null, "log"))
    }, o.prototype.getUser = function(t) {
        var e = this.messenger;
        if (!this.moduleReady) throw Error("This method cannot be called before the API is loaded");
        if (this.IS_MASTER) "function" == typeof SpilGames ? this.isAvailable ? SpilGames(["JSLib"], function(t) {
            t && "function" == typeof t ? t("api.user.getExtended", function(t) {
                e._postMessage(t, void 0, "gameapi.user.getUserResponse")
            }) : e._postMessage({
                userInfoExtended: {}
            }, void 0, "gameapi.user.getUserResponse")
        }) : this.loggedIn ? SpilGames("api.user.getExtended", {
            auth: {
                token: this.token
            },
            context: {
                channelid: 100,
                siteid: 2
            }
        }, function(t) {
            e._postMessage(t, void 0, "gameapi.user.getUserResponse")
        }) : e._postMessage({
            userInfoExtended: {}
        }, void 0, "gameapi.user.getUserResponse") : e._postMessage({
            userInfoExtended: {}
        }, void 0, "gameapi.user.getUserResponse");
        else {
            if ("function" != typeof t) throw Error("The argument passed to the GameAPI.User.getUser method should be a function");
            this.usercallback = t, e._postMessage({}, void 0, "gameapi.user.getUser"), e._postMessage(["log.gameapi.user.getUser", {
                    origin: "slave",
                    argumentType: typeof t
                },
                null
            ], null, "log")
        }
    }, o.prototype._getUserResponse = function(t) {
        var e = t.userInfoExtended || {},
            n = this._validateData(e),
            i = !1;
        "" === e.guid && (i = !0), this.eventTracking.trackGameAPIEvent("userGet", {
            guid: n.guid || "",
            fail: i
        }), this.usercallback(n)
    }, o.prototype._validateData = function(t) {
        var e = {
            uid: t.uid || "",
            guid: t.guid || "",
            displayName: t.name || "",
            pic_square: t.avatarUrl || "",
            pic_square_large: t.avatarLargeUrl || "",
            gender: t.gender || "",
            age: t.age || "",
            birthday: t.birthdate || "",
            level: t.level || "",
            locale: this.locale || ""
        };
        return e
    }, o.prototype._setLocale = function(t) {
        t && t.data && t.data.portal && t.data.portal.siteId && (this.locale = this._getLang(t.data.portal.siteId))
    }, o.prototype._getLang = function(t) {
        for (var e = [{
            siteid: 1,
            lang: "nl-NL"
        }, {
            siteid: 2,
            lang: "en-US"
        }, {
            siteid: 5,
            lang: "de-DE"
        }, {
            siteid: 11,
            lang: "fr-FR"
        }, {
            siteid: 12,
            lang: "fr-FR"
        }, {
            siteid: 15,
            lang: "it-IT"
        }, {
            siteid: 16,
            lang: "pl-PL"
        }, {
            siteid: 24,
            lang: "en-US"
        }, {
            siteid: 25,
            lang: "nl-NL"
        }, {
            siteid: 26,
            lang: "de-DE"
        }, {
            siteid: 44,
            lang: "sv-SE"
        }, {
            siteid: 50,
            lang: "pt-BR"
        }, {
            siteid: 55,
            lang: "en-ID"
        }, {
            siteid: 79,
            lang: "en-US"
        }, {
            siteid: 86,
            lang: "es-ES"
        }, {
            siteid: 87,
            lang: "pt-BR"
        }, {
            siteid: 88,
            lang: "en-US"
        }, {
            siteid: 90,
            lang: "en-US"
        }, {
            siteid: 91,
            lang: "pt-BR"
        }, {
            siteid: 92,
            lang: "en-GB"
        }, {
            siteid: 93,
            lang: "nl-NL"
        }, {
            siteid: 94,
            lang: "de-DE"
        }, {
            siteid: 95,
            lang: "fr-FR"
        }, {
            siteid: 96,
            lang: "es-ES"
        }, {
            siteid: 97,
            lang: "es-ES"
        }, {
            siteid: 98,
            lang: "pl-PL"
        }, {
            siteid: 99,
            lang: "it-IT"
        }, {
            siteid: 100,
            lang: "sv-SE"
        }, {
            siteid: 101,
            lang: "pt-BR"
        }, {
            siteid: 102,
            lang: "en-GB"
        }, {
            siteid: 103,
            lang: "ru-RU"
        }, {
            siteid: 104,
            lang: "ru-RU"
        }, {
            siteid: 105,
            lang: "ru-RU"
        }, {
            siteid: 106,
            lang: "it-IT"
        }, {
            siteid: 107,
            lang: "en-GB"
        }, {
            siteid: 108,
            lang: "sv-SE"
        }, {
            siteid: 109,
            lang: "pl-PL"
        }, {
            siteid: 115,
            lang: "en-GB"
        }, {
            siteid: 116,
            lang: "tr-TR"
        }, {
            siteid: 118,
            lang: "ms-MY"
        }, {
            siteid: 119,
            lang: "en-GB"
        }, {
            siteid: 120,
            lang: "jp-JP"
        }, {
            siteid: 121,
            lang: "en-US"
        }, {
            siteid: 122,
            lang: "es-ES"
        }, {
            siteid: 123,
            lang: "en-US"
        }, {
            siteid: 124,
            lang: "en-US"
        }, {
            siteid: 125,
            lang: "AR"
        }, {
            siteid: 126,
            lang: "en-US"
        }, {
            siteid: 127,
            lang: "en-US"
        }, {
            siteid: 128,
            lang: "nl-NL"
        }, {
            siteid: 129,
            lang: "es-AR"
        }, {
            siteid: 130,
            lang: "es-MX"
        }, {
            siteid: 131,
            lang: "de-DE"
        }, {
            siteid: 132,
            lang: "en-EN"
        }, {
            siteid: 133,
            lang: "en-EN"
        }, {
            siteid: 134,
            lang: "en-ID"
        }, {
            siteid: 135,
            lang: "de-DE"
        }, {
            siteid: 136,
            lang: "pl-PL"
        }, {
            siteid: 137,
            lang: "en-EN"
        }, {
            siteid: 138,
            lang: "it-IT"
        }, {
            siteid: 139,
            lang: "uk-UA"
        }, {
            siteid: 140,
            lang: "en-ID"
        }, {
            siteid: 141,
            lang: "uk-UA"
        }, {
            siteid: 142,
            lang: "ja-JP"
        }, {
            siteid: 143,
            lang: "nl-NL"
        }, {
            siteid: 144,
            lang: "en-US"
        }, {
            siteid: 145,
            lang: "en-US"
        }, {
            siteid: 146,
            lang: "en-US"
        }, {
            siteid: 147,
            lang: "en-US"
        }, {
            siteid: 148,
            lang: "en-US"
        }, {
            siteid: 149,
            lang: "en-IN"
        }, {
            siteid: 150,
            lang: "tr-TR"
        }, {
            siteid: 151,
            lang: "de-DE"
        }, {
            siteid: 152,
            lang: "ru-RU"
        }, {
            siteid: 153,
            lang: "ru-RU"
        }, {
            siteid: 154,
            lang: "ru-RU"
        }, {
            siteid: 155,
            lang: "en-US"
        }, {
            siteid: 156,
            lang: "tr-TR"
        }, {
            siteid: 157,
            lang: "tr-TR"
        }, {
            siteid: 158,
            lang: "tr-TR"
        }, {
            siteid: 159,
            lang: "en-US"
        }, {
            siteid: 160,
            lang: "en-US"
        }, {
            siteid: 161,
            lang: "en-US"
        }, {
            siteid: 162,
            lang: "en-US"
        }, {
            siteid: 163,
            lang: "en-US"
        }, {
            siteid: 164,
            lang: "en-US"
        }, {
            siteid: 165,
            lang: "en-US"
        }, {
            siteid: 166,
            lang: "en-US"
        }, {
            siteid: 167,
            lang: "en-US"
        }, {
            siteid: 168,
            lang: "en-US"
        }, {
            siteid: 169,
            lang: "en-US"
        }, {
            siteid: 170,
            lang: "en-US"
        }, {
            siteid: 171,
            lang: "en-US"
        }, {
            siteid: 172,
            lang: "en-US"
        }, {
            siteid: 173,
            lang: "en-US"
        }, {
            siteid: 174,
            lang: "en-US"
        }, {
            siteid: 175,
            lang: "en-US"
        }, {
            siteid: 176,
            lang: "en-US"
        }, {
            siteid: 177,
            lang: "en-US"
        }, {
            siteid: 178,
            lang: "en-US"
        }, {
            siteid: 179,
            lang: "en-US"
        }, {
            siteid: 180,
            lang: "en-UK"
        }, {
            siteid: 181,
            lang: "nl-NL"
        }, {
            siteid: 182,
            lang: "fr-FR"
        }, {
            siteid: 183,
            lang: "de-DE"
        }, {
            siteid: 184,
            lang: "en-US"
        }, {
            siteid: 185,
            lang: "en-US"
        }, {
            siteid: 186,
            lang: "en-EN"
        }, {
            siteid: 187,
            lang: "en-EN"
        }, {
            siteid: 188,
            lang: "en-EN"
        }, {
            siteid: 189,
            lang: "en-EN"
        }, {
            siteid: 190,
            lang: "en-EN"
        }, {
            siteid: 191,
            lang: "en-US"
        }, {
            siteid: 192,
            lang: "pt-BR"
        }, {
            siteid: 193,
            lang: "en-US"
        }, {
            siteid: 450,
            lang: "en-US"
        }, {
            siteid: 451,
            lang: "nl-NL"
        }, {
            siteid: 452,
            lang: "de-DE"
        }, {
            siteid: 453,
            lang: "fr-FR"
        }, {
            siteid: 454,
            lang: "es-ES"
        }, {
            siteid: 455,
            lang: "it-IT"
        }, {
            siteid: 456,
            lang: "en-GB"
        }, {
            siteid: 457,
            lang: "en-ID"
        }, {
            siteid: 458,
            lang: "es-AR"
        }, {
            siteid: 459,
            lang: "es-LA"
        }, {
            siteid: 460,
            lang: "es-MX"
        }, {
            siteid: 461,
            lang: "jp-JP"
        }, {
            siteid: 462,
            lang: "ms-MY"
        }, {
            siteid: 463,
            lang: "pl-PL"
        }, {
            siteid: 464,
            lang: "pt-BR"
        }, {
            siteid: 465,
            lang: "pt-PT"
        }, {
            siteid: 466,
            lang: "ru-RU"
        }, {
            siteid: 467,
            lang: "sv-SE"
        }, {
            siteid: 468,
            lang: "tr-TR"
        }], n = 0; e.length > n; n++)
            if (e[n].siteid === t) return e[n].lang;
        return ""
    }, l.prototype.init = function(t) {
        this._setupEvents(), t && t.data && t.data.portal && t.data.portal.siteId && 500 > t.data.portal.siteId && "0" !== t.data.portal.siteId && (this.isAvailable = !0)
    }, l.prototype._setupEvents = function() {
        this.IS_MASTER ? (this.messenger.subscribe("gameapi.friends.showInvite", this.showInvite, this), this.messenger.subscribe("gameapi.friends.getFriends", this.getFriends, this)) : this.messenger.subscribe("gameapi.friends.getFriendsResponse", this._getFriendsResponse, this)
    }, l.prototype.showInvite = function() {
        if (!this.moduleReady) throw Error("This method cannot be called before the API is loaded");
        this.IS_MASTER ? "function" == typeof SpilGames && SpilGames.Events !== void 0 && "function" == typeof SpilGames.Events.publish && SpilGames.Events.publish("invitefriends.request") : (this.messenger._postMessage({}, void 0, "gameapi.friends.showInvite"), this.messenger._postMessage(["log.gameapi.friends.showInvite", {
                origin: "slave"
            },
            null
        ], null, "log"), this.eventTracking.trackGameAPIEvent("friendsInvite", {
            guid: this.guid || ""
        }))
    }, l.prototype.getFriends = function(t) {
        var e = this.messenger;
        if (!this.moduleReady) throw Error("This method cannot be called before the API is loaded");
        if (this.IS_MASTER) {
            if ("function" == typeof SpilGames) {
                var n = this;
                SpilGames(["JSLib"], function(t) {
                    t && "function" == typeof t ? t("api.user.getExtended", function(t) {
                        t.userInfoExtended && "guest" !== t.userInfoExtended.name && t.userInfoExtended.guid ? (this.userGuid = t.userInfoExtended.guid, n._getFriendsFromPortal([], 1)) : e._postMessage({
                            friendList: {}
                        }, void 0, "gameapi.friends.getFriendsResponse")
                    }) : e._postMessage({
                        friendList: {}
                    }, void 0, "gameapi.friends.getFriendsResponse")
                })
            }
        } else "function" == typeof t && (this.friendscallback = t), e._postMessage({}, void 0, "gameapi.friends.getFriends"), e._postMessage(["log.gameapi.friends.getFriends", {
                origin: "slave"
            },
            null
        ], null, "log")
    }, l.prototype._getFriendsFromPortal = function(t, e) {
        var n = this.messenger,
            i = t;
        if ("function" == typeof SpilGames) {
            var a = this;
            SpilGames("api.friend.list", {
                guid: this.userGuid,
                pageControl: {
                    page: e,
                    pageSize: 500
                }
            }, function(t) {
                t.error ? n._postMessage(i, void 0, "gameapi.friends.getFriendsResponse") : (i = i.concat(t.friendList), t.pageControl && t.pageControl.totalPages > e ? a._getFriendsFromPortal(i, e + 1) : n._postMessage({
                    friendList: i
                }, void 0, "gameapi.friends.getFriendsResponse"))
            })
        } else n._postMessage({
            friendList: t
        }, void 0, "gameapi.friends.getFriendsResponse")
    }, l.prototype._getFriendsResponse = function(t) {
        var e = this._validateData(t.friendList),
            n = !1;
        0 === e.length && (n = !0), this.eventTracking.trackGameAPIEvent("friendsGet", {
            guid: this.guid || "",
            fail: n
        }), this.friendscallback(e)
    }, l.prototype._validateData = function(t) {
        for (var e = [], n = 0; t.length > n; n++) {
            var i = {
                uid: t[n].uid || "",
                guid: t[n].guid || "",
                displayName: t[n].name || "",
                pic_square: t[n].avatarUrl || "",
                pic_square_large: t[n].avatarLargeUrl || "",
                gender: t[n].gender || "",
                age: t[n].age || ""
            };
            e.push(i)
        }
        return e
    }, p.prototype.init = function(t) {
        t = t || {}, this.data = t.data || this.data, this.data && this.data.user && (this.state.userId = this.data.user.userId || null)
    }, p.prototype._setupMasterEvent = function() {
        this.IS_MASTER && this.messenger.subscribe("gameapi.score", this.submit, this)
    }, p.prototype._obfuscateScore = function(t) {
        var e = 2166136261,
            n = t.length,
            i = 0;
        if (!n) return e;
        for (; n > i; ++i) e ^= t.charCodeAt(i), e += (e << 1) + (e << 4) + (e << 7) + (e << 8) + (e << 24);
        return e >>> 0
    }, p.prototype.submit = function(t) {
        if (!this.moduleReady) throw Error("This method cannot be called before the API is loaded");
        if (this.IS_MASTER) {
            var e = !1,
                n = window.outerHeight - window.innerHeight,
                i = "";
            this.appToken && (i = this.appToken.getAppToken()), n === this.initialHeight && (e = !0), this.eventTracking.trackGameAPIEvent("scoreSubmit", {
                score: t,
                initialheight: this.initialHeight,
                submitheight: n,
                equals: e,
                os: this._obfuscateScore("" + t),
                guid: this.state.userId,
                apptoken: i
            }), "function" == typeof SWFtoJS && SWFtoJS({
                call: "UPDATE_HIGHSCORE",
                params: {
                    score: t
                }
            })
        } else this.messenger._postMessage(t, void 0, "gameapi.score"), this.messenger._postMessage(["log.gameapi.score.submit", {
                origin: "slave",
                score: t
            },
            null
        ], null, "log");
        return {
            success: !0,
            value: t
        }
    }, u.prototype._setupMasterEvent = function() {
        this.IS_MASTER && this.messenger.subscribe("gameapi.award", this.submit, this)
    }, u.prototype.submit = function(t) {
        var e = t.award || "";
        if (!this.moduleReady) throw Error("This method cannot be called before the API is loaded");
        if (this.IS_MASTER) {
            var n = !1;
            window.outerHeight - window.innerHeight === this.initialHeight && (n = !0), this.eventTracking.trackGameAPIEvent("awardSubmit", {
                award: e,
                initialheight: this.initialHeight,
                submitheight: window.outerHeight - window.innerHeight,
                equals: n
            })
        } else this.messenger._postMessage(t, void 0, "gameapi.award"), this.messenger._postMessage(["log.gameapi.award.submit", {
                origin: "slave",
                award: e
            },
            null
        ], null, "log");
        return {
            success: !0,
            value: t.award
        }
    }, c.prototype.init = function(t) {
        t = t || {}, this.data = t.data || this.data, this._setupEvents()
    }, c.prototype._setupEvents = function() {
        var t = this.messenger,
            e = this;
        this.isMaster ? (SpilGames(["JSLib"], function(n) {
            n.subscribe("ad.request.accepted", function(n) {
                !0 === n && e.adRequested && (e.adRequested = !1, SpilGames("game.ad.accepted", !0), t._postMessage(!0, void 0, "ad.request.accepted"))
            }), n.subscribe("ad.complete", function() {
                t._postMessage("", "", "ad.complete")
            })
        }), this.messenger.subscribe("gameapi.ad.request", this._setupAd, this), this.messenger.subscribe("game.ad.request", this._triggerAd, this), this.messenger.subscribe("game.force.break", this._forceGamebreak, this)) : (this.messenger.subscribe("ad.request.accepted", this._onAdAccepted, this), this.messenger.subscribe("ad.complete", this._onAdCompleted, this))
    }, c.prototype._setupAd = function() {
        this.adRequested = !0
    }, c.prototype._triggerAd = function() {
        SpilGames("game.ad.request")
    }, c.prototype._forceGamebreak = function() {
        SpilGames("game.ad.accepted", !0)
    }, c.prototype._runCallback = function(t) {
        this._callbacks[t] && (this._callbacks[t](), this._callbacks[t] = !1)
    }, c.prototype.isAvailable = function() {
        var t = !1;
        return this.data && this.data.portal && this.data.portal.siteId && 187 !== this.data.portal.siteId && 500 > this.data.portal.siteId && (t = !0), t
    }, c.prototype.reward = function(t, e) {
        if ("function" != typeof t) throw Error("pauseGame argument should be a function");
        if ("function" != typeof e) throw Error("resumeGame argument should be a function");
        if (!this.moduleReady) throw Error("This method cannot be called before the API is loaded");
        t(), this.isMaster ? e() : (this._callbacks.resume = e, this.messenger._postMessage(void 0, void 0, "game.force.break"))
    }, c.prototype.request = function(t, e) {
        var n = this;
        if ("function" != typeof t) throw Error("pauseGame argument should be a function");
        if ("function" != typeof e) throw Error("resumeGame argument should be a function");
        if (!this.moduleReady) throw Error("This method cannot be called before the API is loaded");
        this._callbacks.pause = t, this._callbacks.resume = e, this.isMaster || (this.messenger._postMessage(void 0, void 0, "gameapi.ad.request"), this.messenger._postMessage(["log.gameapi.ad.requested", {
                origin: "slave"
            },
            null
        ], null, "log")), this.messenger._postMessage(void 0, void 0, "game.ad.request"), this.timeout = setTimeout(function() {
            n._requestTimeout()
        }, this.timeoutAfter)
    }, c.prototype._onAdAccepted = function(t) {
        var e = this.messenger;
        this.timeout && clearTimeout(this.timeout), !this.isMaster && t && (e._postMessage(["log.gameapi.ad.start", {
                origin: "slave"
            },
            null
        ], null, "log"), this._runCallback("pause"))
    }, c.prototype._onAdCompleted = function() {
        var t = this.messenger;
        this.isMaster || t._postMessage(["log.gameapi.ad.complete", {
                origin: "slave"
            },
            null
        ], null, "log"), this._runCallback("resume")
    }, c.prototype._requestTimeout = function() {
        this._onAdCompleted()
    }, d.prototype._setupEvents = function() {
        this.IS_MASTER && this.messenger.subscribe("gameapi.gameevent", this.emit, this)
    }, d.prototype._validateEvent = function(t) {
        var e = !1;
        return this.events[t] && this.events[t] !== void 0 && (e = !0), e
    }, d.prototype.emit = function(t) {
        if (!this.moduleReady) throw Error("This method cannot be called before the API is loaded");
        this._validateEvent(t) ? this.IS_MASTER ? "function" == typeof SWFtoJS && SWFtoJS({
            call: t
        }) : (this.messenger._postMessage(t, void 0, "gameapi.gameevent"), this.messenger._postMessage(["log.gameapi.gameevent.emit", {
                origin: "slave",
                evt: t
            },
            null
        ], null, "log")) : this.IS_MASTER || this.messenger._postMessage(["log.gameapi.gameevent.emit", {
                origin: "slave"
            },
            null
        ], null, "log")
    }, h.prototype.init = function(t) {
        t = t || {}, this.data = t.data || this.data;
        var e = this.data && this.data.game && this.data.game.applicationId ? this.data.game.applicationId : null,
            n = new Date,
            i = window.location.hostname;
        this.data && this.data.portal ? (this.isGamestate = this.data.portal.gamestate || !1, this.siteId = this.data.portal.siteId ? this.data.portal.siteId : null, this.channelId = this.data.portal.channelId ? this.data.portal.channelId : null) : (this.siteId = null, this.channelId = null), this.configureInternalTracking(e, n, i), this.isGamestate || (this.IS_SLAVE || this.IS_STANDALONE || _.isWrapped()) && this.startInternalTracking()
    }, h.prototype._createEventObject = function(t, e, n) {
        return {
            eventCategory: t,
            eventAction: e,
            properties: n
        }
    }, h.prototype._sendSETEvent = function(t, e, n) {
        return this.IS_STANDALONE ? _.submitData("http://logs.spilgames.com/lg/pb/1/ut/", e, n) : this.messenger && this.messenger.post("tracker.event." + t, e, n), e
    }, h.prototype.trackGamePlay = function(t) {
        if (!this.gamePlayTracking.started) return !1;
        var e = this.gamePlayTracking.appid,
            n = this.gamePlayTracking.timestamp,
            i = this.gamePlayTracking.host,
            a = this._createEventObject("game", "gameplay", {
                applicationId: e,
                start: n,
                host: i
            }),
            s = this.data.isLocal,
            r = !0,
            o = 0,
            l = 0;
        this.siteId && (o = parseInt(this.siteId, 10)), this.channelId && (l = parseInt(this.channelId, 10)), this.data && this.data.branding && this.data.branding.logo && this.data.branding.logo.image && (r = !1);
        var p = this._createEventObject("gameapi", "load", {
            siteid: o,
            appid: e,
            channelid: l,
            domainname: i,
            isstandalone: this.IS_STANDALONE,
            isfallbackconfig: s,
            iswhitelisted: r
        });
        return this._sendSETEvent("express", a, t), this._sendSETEvent("express", p, function() {}), a
    }, h.prototype.trackTimeInGame = function(t) {
        if (!this.timeInGameTracking.started) return !1;
        var e = this.timeInGameTracking.appid,
            n = this.timeInGameTracking.timestamp,
            i = this._createEventObject("game", "heartbeat", {
                applicationId: e,
                start: n
            });
        return this._sendSETEvent("express", i, t), i
    }, h.prototype.trackGameAPIEvent = function(t, e) {
        e.appid = this.gamePlayTracking.appid, e.domainname = this.gamePlayTracking.host, e.siteid = parseInt(this.siteId, 10), e.channelid = parseInt(this.channelId, 10);
        var n = this._createEventObject("gameapi", t, e);
        this._sendSETEvent("express", n, function() {})
    }, h.prototype.configureInternalTracking = function(t, e, n) {
        return t ? (this.gamePlayTracking.appid = t, this.gamePlayTracking.timestamp = Date.parse(e), this.gamePlayTracking.host = n, this.timeInGameTracking.appid = t, this.timeInGameTracking.timestamp = Date.parse(e), void 0) : {
            error: "No application ID defined for this game"
        }
    }, h.prototype.startInternalTracking = function() {
        var t = this,
            e = 6e4,
            n = function(t) {
                if (!t) throw "Could not save the time in game"
            };
        return this.moduleReady ? this.gamePlayTracking.appid ? (this.gamePlayTracking.started = !0, this.timeInGameTracking.started = !0, this.trackGamePlay(function(t) {
            if (!t) throw "Could not save the game play"
        }), this.trackTimeInGame(n), setInterval(function() {
            t.trackTimeInGame(n)
        }, e), this.gamePlayTracking.started && this.timeInGameTracking.started) : {
            error: "No application ID defined for this game"
        } : {
            error: "This method cannot be called before the API is loaded"
        }
    }, g.prototype.init = function(t) {
        var e;
        t = t || {}, this.data = t.data || this.data, this.data && this.data.portal && this.data.portal.siteId && (e = this.data.portal.siteId, (e > 499 || 12 === e || 25 === e || 26 === e || 55 === e || 79 === e || 97 === e || 105 === e || 108 === e || 138 === e || 157 === e || 121 === e || 1 === e || 5 === e || 11 === e || 15 === e || 16 === e || 44 === e || 50 === e || 87 === e || 86 === e || 88 === e || 92 === e || 103 === e || 140 === e || 90 === e || 93 === e || 95 === e || 94 === e || 96 === e || 98 === e || 99 === e || 100 === e || 101 === e || 102 === e || 104 === e || 134 === e) && this.data.branding && this.data.branding.more_games && this.data.branding.more_games.handler && "moreGames" !== this.data.branding.more_games.handler && (this.data.branding.more_games.handler = "moreGames"))
    }, g.prototype.getLogo = function(t) {
        if (!this.moduleReady) return {
            error: "This method cannot be called before the API is loaded"
        };
        var e = this.IS_MASTER ? "master" : "slave";
        this.messenger._postMessage(["log.branding.getlogo", {
                origin: e
            },
            null
        ], null, "log");
        var n, i, a = {
            type: {
                type: "String",
                values: ["png"]
            },
            width: "Number",
            height: "Number"
        };
        return n = this._getLink("logo"), t && "object" == typeof t && (i = _.validateSchema(a, t), i.error && (n.error = i.error)), n
    }, g.prototype.getLink = function(t) {
        if (!t) return {
            error: "No link identifier provided"
        };
        var e = this.listLinks();
        if (-1 !== e.indexOf(t)) {
            var n = this.IS_MASTER ? "master" : "slave";
            return this.messenger._postMessage(["log.branding.getlink", {
                    origin: n,
                    linkName: t
                },
                null
            ], null, "log"), this._getLink(t)
        }
        return {
            error: "Invalid option: '" + t + "'",
            action: function() {}
        }
    }, g.prototype._getLink = function(t) {
        if (!t) return {
            error: "No link identifier provided"
        };
        var e = this.data && this.data.branding ? this.data.branding : {};
        return e && e[t] ? {
            linkName: t,
            image: e[t].image || !1,
            action: this._executeHandler.bind(this, t)
        } : {
            error: "Invalid option: '" + t + "'",
            action: function() {}
        }
    }, g.prototype._getGMLink = function(t) {
        var e = null;
        if (!t) return {
            error: "No link identifier provided"
        };
        var n = this.data && this.data.branding ? this.data.branding : {};
        return n && n[t] ? (e = this._tagUrl(n[t].url, t), {
            linkName: t,
            url: e
        }) : {
            error: "Invalid option: '" + t + "'",
            url: null
        }
    }, g.prototype.getLinks = function() {
        var t = {},
            e = this.listLinks();
        if (0 === e.length) t = {
            more_games: {
                action: function() {}
            }
        };
        else
            for (var n = 0; e.length > n; n++) {
                var i = e[n];
                t[i] = this._getLink(i)
            }
        return t
    }, g.prototype._executeHandler = function(t) {
        var e = this.data && this.data.branding ? this.data.branding : {},
            n = e[t],
            i = n.handler,
            a = this._tagUrl(n.url, t),
            s = this._getBrandName(e);
        if (n.url && n.url.length > 0 && i && this.components[i]) {
            var r = this.IS_MASTER ? "master" : "slave";
            return this.messenger._postMessage(["log.branding.linkAction", {
                    origin: r,
                    linkName: t
                },
                null
            ], null, "log"), this.components[i]({
                url: a,
                messenger: this.messenger,
                isStandalone: this.IS_STANDALONE,
                brandName: s
            })
        }
        return function() {}
    }, g.prototype._getBrandName = function(t) {
        var e = "a10";
        if (t && t.more_games && t.more_games.url) {
            var n = t.more_games.url;
            e = n.replace(/(.*)www./, "").replace(/\..*/, "")
        }
        return e
    }, g.prototype.listLinks = function() {
        var t = [],
            e = this.data && this.data.branding ? this.data.branding : {},
            n = Object.keys(e);
        return t = n.filter(function(t) {
            return !e[t].blacklisted
        })
    }, g.prototype.getSplashScreen = function() {
        var t, e = this.IS_MASTER ? "master" : "slave";
        if (this.data && this.data.branding && this.data.branding.splash_screen) {
            var n = !0;
            this.data.branding.splash_screen.image || this.data.branding.splash_screen.url || (n = !1), t = {
                show: n,
                action: this._getLink("splash_screen").action || function() {}
            }
        } else t = {
            show: !0,
            action: function() {}
        };
        return this.messenger._postMessage(["log.branding.splashScreen", {
                origin: e
            },
            null
        ], null, "log"), t
    }, g.prototype.displaySplashScreen = function(t) {
        if ("function" != typeof t) throw Error("argument  passed to displaySplashScreen method should be a function");
        var e = this.IS_MASTER ? "master" : "slave",
            n = this._getLink("logo").image;
        n && this.getSplashScreen().show ? ("master" !== e && this.messenger._postMessage(["log.branding.displaySplashScreen", {
                origin: e
            },
            null
        ], null, "log"), this.components.displayOnTop({
            url: n,
            action: this.getSplashScreen().action,
            callback: t
        })) : t()
    }, g.prototype._tagUrl = function(t, e) {
        var n, i, a, s = this.data && this.data.portal ? this.data.portal : {},
            r = this.data && this.data.game ? this.data.game : {},
            o = parseInt(s.siteId, 10);
        if ("string" != typeof t) throw Error("No url specified");
        return n = "string" == typeof e ? e : "logo", i = "brandedgames_" + (o > 0 && 500 > o ? "internal" : "external"), a = ["utm_medium=" + i, "utm_campaign=" + r.applicationId, "utm_source=" + s.host, "utm_content=" + n].join("&"), t += t.indexOf("?") > -1 ? "&" : "?", t + a
    }, f.prototype.encode = function() {
        var t = ["gameapi", this.type, this.callbackId, this.data ? JSON.stringify(this.data) : ""].join("|");
        return t
    }, y.prototype._postMessage = function(t, e, n) {
        var i, a;
        i = _.isArray(t) && "function" == typeof t[t.length - 1] ? this._callbacks.push(t.pop()) - 1 : e, a = new f({
            type: n || "jslib",
            callbackId: i,
            data: t
        }).encode();
        for (var s = 0; this._targets.length > s; s++) this._targets[s].postMessage(a, "*")
    }, y.prototype._callJSLib = function() {
        SpilGames.apply(SpilGames, _.argsToArray(arguments))
    }, y.prototype._setupEventListener = function() {
        window.addEventListener ? window.addEventListener("message", this._handleMessage.bind(this), !1) : window.attachEvent && window.attachEvent("onmessage", this._handleMessage.bind(this))
    }, y.prototype._handleMessage = function(t) {
        var e, n, i, a, s = this,
            r = new f(t.data);
        if (r)
            if (e = r.type, n = r.callbackId, i = r.data, a = this._callbacks[n] || !1, this.IS_MASTER) switch (e) {
                case "jslib":
                    "Array" === i.constructor.name && i.push(function(t) {
                        s._postMessage(t, n)
                    }), this._callJSLib.apply(this, i);
                    break;
                case "ugapi":
                    this._handleUGARequest(t);
                    break;
                case "datachange":
                    this._postMessage(i, null, "datachange");
                    break;
                default:
                    this.publish(e, i)
            } else this.IS_SLAVE && ("function" == typeof a ? (delete this._callbacks[n], a(i)) : "datachange" === e || "jslib" !== e && this.publish(e, i));
        return !1
    }, y.prototype._handleUGARequest = function(t) {
        var e, n, i, a = this,
            s = new f(t.data);
        if (s) switch (e = s.data[0], n = s.callbackId, i = s.data[1] ? s.data[1] : null, e) {
            case "GameAPI.data":
                a._postMessage(this.dataStore._getCache(), n, "ugapi");
                break;
            case "GameAPI.isReady":
                a._postMessage({
                    isready: this.api.isReady
                }, n, "ugapi")
        }
    }, y.prototype.post = function() {
        var t = _.argsToArray(arguments);
        return this.IS_SLAVE ? this._postMessage(t) : this._callJSLib.apply(this, t), this
    }, y.prototype.publish = function(t, e) {
        return this._channels[t] && this._channels[t].forEach(function(t) {
            try {
                t.fn.call(t.ctx, e)
            } catch (n) {}
        }), this
    }, y.prototype.subscribe = function(t, e, n) {
        if ("function" != typeof e) throw Error("Callback has to be a function");
        if ("string" != typeof t) throw Error("Channel name has to be a string");
        return this._channels[t] || (this._channels[t] = []), this._channels[t].push({
            fn: e,
            ctx: n
        }), this
    }, y.prototype.unsubscribe = function(t, e) {
        return this._channels[t] && "function" == typeof e && (this._channels[t] = this._channels[t].filter(function(t) {
            return t.fn !== e
        })), this
    }, y.prototype.subscribeOnce = function(t, e, n) {
        function i(n) {
            a.unsubscribe(t, i), e.call(this, n)
        }
        var a = this;
        return this.subscribe(t, i, n)
    }, y.prototype.requestFromParent = function(t, e, n) {
        if (!this.IS_SLAVE) throw "You are the parent, stop talking to yourself";
        e = e || {}, this._postMessage([t, e, n], null, "ugapi")
    }, v.prototype._addBasic = function(t, e) {
        var n = e || {};
        return n.isMaster = this.IS_MASTER, n.isStandalone = this.IS_STANDALONE, n.messenger = this.__.messenger, n.data = null, n
    }, v.prototype._addEventTracking = function(t) {
        var e = t || {};
        return e.eventTracking = this.__.EventTracking, e
    }, v.prototype._addComponents = function(t) {
        var e = t || {};
        return e.components = this.__.components, e
    }, v.prototype._addInitialHeight = function(t) {
        var e = t || {};
        return e.initialHeight = window.outerHeight - window.innerHeight, e
    }, v.prototype._addAppToken = function(t) {
        var e = t || {};
        return e.appToken = this.AppToken, e
    }, v.prototype._setRole = function() {
        var t = _.getRole();
        this.IS_MASTER = t.IS_MASTER, this.IS_SLAVE = t.IS_SLAVE, this.IS_STANDALONE = t.IS_STANDALONE
    }, v.prototype._getTargets = function() {
        if (this.IS_STANDALONE) return [window];
        if (this.IS_MASTER) {
            for (var t = ["iframegame", "iframeGameState"], e = null, n = [], i = 0; t.length > i; i++) e = document.getElementById(t[i]), e && e.contentWindow && n.push(e.contentWindow);
            return n
        }
        return [window.parent]
    }, v.prototype.loadAPI = function(t, e) {
        function i(e) {
            p.IS_MASTER && (e = a(e));
            var n = e.portal && e.portal.gamestate || !1,
                i = e.game && e.game.properties && e.game.properties.highscore || !1;
            return p.isReady = !0, p.Branding.moduleReady = !0, p.__.EventTracking.moduleReady = !0, p.GameState.moduleReady = !0, p.GameBreak.moduleReady = !0, p.Game.moduleReady = !0, p.Score.moduleReady = !0, p.Award.moduleReady = !0, p.User.moduleReady = !0, p.Friends.moduleReady = !0, p.GameEvent.moduleReady = !0, p.Localization.moduleReady = !0, p.AppToken.moduleReady = !0, (n || i) && p.AppToken.init({
                data: e
            }), p.__.EventTracking.init({
                data: e
            }), n && p.GameState.init({
                data: e
            }), n || (p.Branding.init({
                data: e
            }), p.Game.init({
                data: e
            }), p.Score.init({
                data: e
            }), p.GameBreak.init({
                data: e
            }), p.Friends.init({
                data: e
            }), p.User.init({
                data: e
            }), p.Localization.init({
                data: e
            })), p.__.messenger._postMessage(["log.gameapi.loadapi.finish", {
                    origin: u,
                    version: p.version
                },
                null
            ], null, "log"), t(p)
        }

        function a(t) {
            var e = t.game || {},
                n = t.user || {},
                i = t.portal || {},
                a = t.branding || {},
                s = t.localization || {};
            return A.getLocalConfig({
                game: e,
                user: n,
                portal: i,
                branding: a,
                localization: s
            })
        }

        function s() {
            p.__.messenger.requestFromParent("GameAPI.data", {}, function(t) {
                i(t)
            })
        }

        function r() {
            p.IS_STANDALONE = !0, p.IS_MASTER = !0, p.IS_SLAVE = !0, p.__.dataStore = new n({
                isMaster: !0
            }), e = e || null, A.setupStandaloneMode(e, function(t) {
                p.__.dataStore._setCache(a(t)), i(t)
            })
        }

        function o() {
            p.__.messenger.requestFromParent("GameAPI.isReady", {}, function(t) {
                l && clearTimeout(l), t.isready ? s() : 5 > c ? (c++, setTimeout(o, 500)) : (_.log("GameAPI:checkMasterReady not ready but reached max wait"), s())
            })
        }
        var l, p = this,
            u = this.IS_MASTER ? "master" : "slave",
            c = 0;
        if (e !== void 0 && e.id !== void 0 && "576742227280293562" === e.id && (window.onkeydown = null), "function" != typeof t) throw Error("argument passed to loadAPI method should be a function");
        return !0 === this.isReady ? (_.log("WARNING: Detected multiple executions of GameAPI.loadAPI(). This method should only be executed once per page load!"), t(p)) : (this.__.messenger._postMessage(["log.gameapi.loadapi.start", {
                origin: u,
                version: p.version,
                spildata: e
            },
            null
        ], null, "log"), this.IS_STANDALONE ? r() : this.IS_MASTER ? A.getGameConfig().then(function(t) {
            A.getBrandingConfig(t).then(function(e) {
                t && !t.isError ? (t.branding = e.branding, t.localization = e.localization, p.__.dataStore._setCache(a(t))) : _.log("GameAPI gameConfig error: ", t.isError), i(t)
            })
        }) : e && e.gamestate ? i(A.configFromData(e)) : (l = setTimeout(r, 600), o()), void 0)
    };
    var T = new v(n, y, g, h, c);
    "function" == typeof define && define.amd && define("GameAPI", T), t.GameAPI = T
})(window),
function() {
    "use strict";

    function t(t) {
        t && (t.setTargetValueAtTime || (t.setTargetValueAtTime = t.setTargetAtTime))
    }
    window.hasOwnProperty && window.hasOwnProperty("AudioContext") && (window.webkitAudioContext = AudioContext, AudioContext.prototype.hasOwnProperty("internal_createGain") || (AudioContext.prototype.internal_createGain = AudioContext.prototype.createGain, AudioContext.prototype.createGain = function() {
        var e = this.internal_createGain();
        return t(e.gain), e
    }), AudioContext.prototype.hasOwnProperty("internal_createDelay") || (AudioContext.prototype.internal_createDelay = AudioContext.prototype.createDelay, AudioContext.prototype.createDelay = function() {
        var e = this.internal_createDelay();
        return t(e.delayTime), e
    }), AudioContext.prototype.hasOwnProperty("internal_createBufferSource") || (AudioContext.prototype.internal_createBufferSource = AudioContext.prototype.createBufferSource, AudioContext.prototype.createBufferSource = function() {
        var e = this.internal_createBufferSource();
        return e.noteOn || (e.noteOn = e.start), e.noteGrainOn || (e.noteGrainOn = e.start), e.noteOff || (e.noteOff = e.stop), t(e.playbackRate), e
    }), AudioContext.prototype.hasOwnProperty("internal_createDynamicsCompressor") || (AudioContext.prototype.internal_createDynamicsCompressor = AudioContext.prototype.createDynamicsCompressor, AudioContext.prototype.createDynamicsCompressor = function() {
        var e = this.internal_createDynamicsCompressor();
        return t(e.threshold), t(e.knee), t(e.ratio), t(e.reduction), t(e.attack), t(e.release), e
    }), AudioContext.prototype.hasOwnProperty("internal_createBiquadFilter") || (AudioContext.prototype.internal_createBiquadFilter = AudioContext.prototype.createBiquadFilter, AudioContext.prototype.createBiquadFilter = function() {
        var e = this.internal_createBiquadFilter();
        t(e.frequency), t(e.detune), t(e.Q), t(e.gain);
        for (var n = ["LOWPASS", "HIGHPASS", "BANDPASS", "LOWSHELF", "HIGHSHELF", "PEAKING", "NOTCH", "ALLPASS"], i = 0; n.length > i; ++i) {
            var a = n[i],
                s = a.toLowerCase();
            e.hasOwnProperty(a) || (e[a] = s)
        }
        return e
    }), AudioContext.prototype.hasOwnProperty("internal_createOscillator") || AudioContext.prototype.hasOwnProperty("createOscillator") && (AudioContext.prototype.internal_createOscillator = AudioContext.prototype.createOscillator, AudioContext.prototype.createOscillator = function() {
        var e = this.internal_createOscillator();
        e.noteOn || (e.noteOn = e.start), e.noteOff || (e.noteOff = e.stop), t(e.frequency), t(e.detune);
        for (var n = ["SINE", "SQUARE", "SAWTOOTH", "TRIANGLE", "CUSTOM"], i = 0; n.length > i; ++i) {
            var a = n[i],
                s = a.toLowerCase();
            e.hasOwnProperty(a) || (e[a] = s)
        }
        return e.hasOwnProperty("setWaveTable") || (e.setWaveTable = e.setPeriodicTable), e
    }), AudioContext.prototype.hasOwnProperty("internal_createPanner") || (AudioContext.prototype.internal_createPanner = AudioContext.prototype.createPanner, AudioContext.prototype.createPanner = function() {
        var t = this.internal_createPanner(),
            e = {
                EQUALPOWER: "equalpower",
                HRTF: "HRTF",
                LINEAR_DISTANCE: "linear",
                INVERSE_DISTANCE: "inverse",
                EXPONENTIAL_DISTANCE: "exponential"
            };
        for (var n in e) {
            var i = e[n];
            t.hasOwnProperty(n) || (t[n] = i)
        }
        return t
    }), AudioContext.prototype.hasOwnProperty("createGainNode") || (AudioContext.prototype.createGainNode = AudioContext.prototype.createGain), AudioContext.prototype.hasOwnProperty("createDelayNode") || (AudioContext.prototype.createDelayNode = AudioContext.prototype.createDelay), AudioContext.prototype.hasOwnProperty("createJavaScriptNode") || (AudioContext.prototype.createJavaScriptNode = AudioContext.prototype.createScriptProcessor), AudioContext.prototype.hasOwnProperty("createWaveTable") || (AudioContext.prototype.createWaveTable = AudioContext.prototype.createPeriodicWave))
}();