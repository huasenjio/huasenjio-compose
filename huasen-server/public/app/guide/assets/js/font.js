(function () {
  "use strict";

  var _WINDOW = {};
  var _DOCUMENT = {};

  try {
    if (typeof window !== "undefined") _WINDOW = window;
    if (typeof document !== "undefined") _DOCUMENT = document;
  } catch (e) { }

  var _ref = _WINDOW.navigator || {},
    _ref$userAgent = _ref.userAgent,
    userAgent = _ref$userAgent === void 0 ? "" : _ref$userAgent;

  var WINDOW = _WINDOW;
  var DOCUMENT = _DOCUMENT;
  var IS_BROWSER = !!WINDOW.document;
  var IS_DOM =
    !!DOCUMENT.documentElement &&
    !!DOCUMENT.head &&
    typeof DOCUMENT.addEventListener === "function" &&
    typeof DOCUMENT.createElement === "function";
  var IS_IE = ~userAgent.indexOf("MSIE") || ~userAgent.indexOf("Trident/");

  var NAMESPACE_IDENTIFIER = "___FONT_AWESOME___";
  var PRODUCTION = (function () {
    try {
      return "production" === "production";
    } catch (e) {
      return false;
    }
  })();

  function bunker(fn) {
    try {
      fn();
    } catch (e) {
      if (!PRODUCTION) {
        throw e;
      }
    }
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true,
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      var ownKeys = Object.keys(source);

      if (typeof Object.getOwnPropertySymbols === "function") {
        ownKeys = ownKeys.concat(
          Object.getOwnPropertySymbols(source).filter(function (sym) {
            return Object.getOwnPropertyDescriptor(source, sym).enumerable;
          })
        );
      }

      ownKeys.forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    }

    return target;
  }

  var w = WINDOW || {};
  if (!w[NAMESPACE_IDENTIFIER]) w[NAMESPACE_IDENTIFIER] = {};
  if (!w[NAMESPACE_IDENTIFIER].styles) w[NAMESPACE_IDENTIFIER].styles = {};
  if (!w[NAMESPACE_IDENTIFIER].hooks) w[NAMESPACE_IDENTIFIER].hooks = {};
  if (!w[NAMESPACE_IDENTIFIER].shims) w[NAMESPACE_IDENTIFIER].shims = [];
  var namespace = w[NAMESPACE_IDENTIFIER];

  function defineIcons(prefix, icons) {
    var params =
      arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var _params$skipHooks = params.skipHooks,
      skipHooks = _params$skipHooks === void 0 ? false : _params$skipHooks;
    var normalized = Object.keys(icons).reduce(function (acc, iconName) {
      var icon = icons[iconName];
      var expanded = !!icon.icon;

      if (expanded) {
        acc[icon.iconName] = icon.icon;
      } else {
        acc[iconName] = icon;
      }

      return acc;
    }, {});

    if (typeof namespace.hooks.addPack === "function" && !skipHooks) {
      namespace.hooks.addPack(prefix, normalized);
    } else {
      namespace.styles[prefix] = _objectSpread(
        {},
        namespace.styles[prefix] || {},
        normalized
      );
    }
    /**
     * Font Awesome 4 used the prefix of `fa` for all icons. With the introduction
     * of new styles we needed to differentiate between them. Prefix `fa` is now an alias
     * for `fas` so we'll easy the upgrade process for our users by automatically defining
     * this as well.
     */

    if (prefix === "fas") {
      defineIcons("fa", icons);
    }
  }

  var icons = {
    github: [
      496,
      512,
      [],
      "f09b",
      "M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z",
    ],
    qq: [
      448,
      512,
      [],
      "f1d6",
      "M433.754 420.445c-11.526 1.393-44.86-52.741-44.86-52.741 0 31.345-16.136 72.247-51.051 101.786 16.842 5.192 54.843 19.167 45.803 34.421-7.316 12.343-125.51 7.881-159.632 4.037-34.122 3.844-152.316 8.306-159.632-4.037-9.045-15.25 28.918-29.214 45.783-34.415-34.92-29.539-51.059-70.445-51.059-101.792 0 0-33.334 54.134-44.859 52.741-5.37-.65-12.424-29.644 9.347-99.704 10.261-33.024 21.995-60.478 40.144-105.779C60.683 98.063 108.982.006 224 0c113.737.006 163.156 96.133 160.264 214.963 18.118 45.223 29.912 72.85 40.144 105.778 21.768 70.06 14.716 99.053 9.346 99.704z",
    ],
    twitter: [
      512,
      512,
      [],
      "f099",
      "M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z",
    ],
    weibo: [
      512,
      512,
      [],
      "f18a",
      "M407 177.6c7.6-24-13.4-46.8-37.4-41.7-22 4.8-28.8-28.1-7.1-32.8 50.1-10.9 92.3 37.1 76.5 84.8-6.8 21.2-38.8 10.8-32-10.3zM214.8 446.7C108.5 446.7 0 395.3 0 310.4c0-44.3 28-95.4 76.3-143.7C176 67 279.5 65.8 249.9 161c-4 13.1 12.3 5.7 12.3 6 79.5-33.6 140.5-16.8 114 51.4-3.7 9.4 1.1 10.9 8.3 13.1 135.7 42.3 34.8 215.2-169.7 215.2zm143.7-146.3c-5.4-55.7-78.5-94-163.4-85.7-84.8 8.6-148.8 60.3-143.4 116s78.5 94 163.4 85.7c84.8-8.6 148.8-60.3 143.4-116zM347.9 35.1c-25.9 5.6-16.8 43.7 8.3 38.3 72.3-15.2 134.8 52.8 111.7 124-7.4 24.2 29.1 37 37.4 12 31.9-99.8-55.1-195.9-157.4-174.3zm-78.5 311c-17.1 38.8-66.8 60-109.1 46.3-40.8-13.1-58-53.4-40.3-89.7 17.7-35.4 63.1-55.4 103.4-45.1 42 10.8 63.1 50.2 46 88.5zm-86.3-30c-12.9-5.4-30 .3-38 12.9-8.3 12.9-4.3 28 8.6 34 13.1 6 30.8.3 39.1-12.9 8-13.1 3.7-28.3-9.7-34zm32.6-13.4c-5.1-1.7-11.4.6-14.3 5.4-2.9 5.1-1.4 10.6 3.7 12.9 5.1 2 11.7-.3 14.6-5.4 2.8-5.2 1.1-10.9-4-12.9z",
    ],
    zhihu: [
      640,
      512,
      [],
      "f63f",
      "M170.54 148.13v217.54l23.43.01 7.71 26.37 42.01-26.37h49.53V148.13H170.54zm97.75 193.93h-27.94l-27.9 17.51-5.08-17.47-11.9-.04V171.75h72.82v170.31zm-118.46-94.39H97.5c1.74-27.1 2.2-51.59 2.2-73.46h51.16s1.97-22.56-8.58-22.31h-88.5c3.49-13.12 7.87-26.66 13.12-40.67 0 0-24.07 0-32.27 21.57-3.39 8.9-13.21 43.14-30.7 78.12 5.89-.64 25.37-1.18 36.84-22.21 2.11-5.89 2.51-6.66 5.14-14.53h28.87c0 10.5-1.2 66.88-1.68 73.44H20.83c-11.74 0-15.56 23.62-15.56 23.62h65.58C66.45 321.1 42.83 363.12 0 396.34c20.49 5.85 40.91-.93 51-9.9 0 0 22.98-20.9 35.59-69.25l53.96 64.94s7.91-26.89-1.24-39.99c-7.58-8.92-28.06-33.06-36.79-41.81L87.9 311.95c4.36-13.98 6.99-27.55 7.87-40.67h61.65s-.09-23.62-7.59-23.62v.01zm412.02-1.6c20.83-25.64 44.98-58.57 44.98-58.57s-18.65-14.8-27.38-4.06c-6 8.15-36.83 48.2-36.83 48.2l19.23 14.43zm-150.09-59.09c-9.01-8.25-25.91 2.13-25.91 2.13s39.52 55.04 41.12 57.45l19.46-13.73s-25.67-37.61-34.66-45.86h-.01zM640 258.35c-19.78 0-130.91.93-131.06.93v-101c4.81 0 12.42-.4 22.85-1.2 40.88-2.41 70.13-4 87.77-4.81 0 0 12.22-27.19-.59-33.44-3.07-1.18-23.17 4.58-23.17 4.58s-165.22 16.49-232.36 18.05c1.6 8.82 7.62 17.08 15.78 19.55 13.31 3.48 22.69 1.7 49.15.89 24.83-1.6 43.68-2.43 56.51-2.43v99.81H351.41s2.82 22.31 25.51 22.85h107.94v70.92c0 13.97-11.19 21.99-24.48 21.12-14.08.11-26.08-1.15-41.69-1.81 1.99 3.97 6.33 14.39 19.31 21.84 9.88 4.81 16.17 6.57 26.02 6.57 29.56 0 45.67-17.28 44.89-45.31v-73.32h122.36c9.68 0 8.7-23.78 8.7-23.78l.03-.01z",
    ],
  };

  bunker(function () {
    defineIcons("fab", icons);
  });
})();
(function () {
  "use strict";

  var _WINDOW = {};
  var _DOCUMENT = {};

  try {
    if (typeof window !== "undefined") _WINDOW = window;
    if (typeof document !== "undefined") _DOCUMENT = document;
  } catch (e) { }

  var _ref = _WINDOW.navigator || {},
    _ref$userAgent = _ref.userAgent,
    userAgent = _ref$userAgent === void 0 ? "" : _ref$userAgent;

  var WINDOW = _WINDOW;
  var DOCUMENT = _DOCUMENT;
  var IS_BROWSER = !!WINDOW.document;
  var IS_DOM =
    !!DOCUMENT.documentElement &&
    !!DOCUMENT.head &&
    typeof DOCUMENT.addEventListener === "function" &&
    typeof DOCUMENT.createElement === "function";
  var IS_IE = ~userAgent.indexOf("MSIE") || ~userAgent.indexOf("Trident/");

  var NAMESPACE_IDENTIFIER = "___FONT_AWESOME___";
  var PRODUCTION = (function () {
    try {
      return "production" === "production";
    } catch (e) {
      return false;
    }
  })();

  function bunker(fn) {
    try {
      fn();
    } catch (e) {
      if (!PRODUCTION) {
        throw e;
      }
    }
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true,
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      var ownKeys = Object.keys(source);

      if (typeof Object.getOwnPropertySymbols === "function") {
        ownKeys = ownKeys.concat(
          Object.getOwnPropertySymbols(source).filter(function (sym) {
            return Object.getOwnPropertyDescriptor(source, sym).enumerable;
          })
        );
      }

      ownKeys.forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    }

    return target;
  }

  var w = WINDOW || {};
  if (!w[NAMESPACE_IDENTIFIER]) w[NAMESPACE_IDENTIFIER] = {};
  if (!w[NAMESPACE_IDENTIFIER].styles) w[NAMESPACE_IDENTIFIER].styles = {};
  if (!w[NAMESPACE_IDENTIFIER].hooks) w[NAMESPACE_IDENTIFIER].hooks = {};
  if (!w[NAMESPACE_IDENTIFIER].shims) w[NAMESPACE_IDENTIFIER].shims = [];
  var namespace = w[NAMESPACE_IDENTIFIER];

  function defineIcons(prefix, icons) {
    var params =
      arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var _params$skipHooks = params.skipHooks,
      skipHooks = _params$skipHooks === void 0 ? false : _params$skipHooks;
    var normalized = Object.keys(icons).reduce(function (acc, iconName) {
      var icon = icons[iconName];
      var expanded = !!icon.icon;

      if (expanded) {
        acc[icon.iconName] = icon.icon;
      } else {
        acc[iconName] = icon;
      }

      return acc;
    }, {});

    if (typeof namespace.hooks.addPack === "function" && !skipHooks) {
      namespace.hooks.addPack(prefix, normalized);
    } else {
      namespace.styles[prefix] = _objectSpread(
        {},
        namespace.styles[prefix] || {},
        normalized
      );
    }
    /**
     * Font Awesome 4 used the prefix of `fa` for all icons. With the introduction
     * of new styles we needed to differentiate between them. Prefix `fa` is now an alias
     * for `fas` so we'll easy the upgrade process for our users by automatically defining
     * this as well.
     */

    if (prefix === "fas") {
      defineIcons("fa", icons);
    }
  }

  var icons = {
    envelope: [
      512,
      512,
      [],
      "f0e0",
      "M502.3 190.8c3.9-3.1 9.7-.2 9.7 4.7V400c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V195.6c0-5 5.7-7.8 9.7-4.7 22.4 17.4 52.1 39.5 154.1 113.6 21.1 15.4 56.7 47.8 92.2 47.6 35.7.3 72-32.8 92.3-47.6 102-74.1 131.6-96.3 154-113.7zM256 320c23.2.4 56.6-29.2 73.4-41.4 132.7-96.3 142.8-104.7 173.4-128.7 5.8-4.5 9.2-11.5 9.2-18.9v-19c0-26.5-21.5-48-48-48H48C21.5 64 0 85.5 0 112v19c0 7.4 3.4 14.3 9.2 18.9 30.6 23.9 40.7 32.4 173.4 128.7 16.8 12.2 50.2 41.8 73.4 41.4z",
    ],
    paw: [
      512,
      512,
      [],
      "f1b0",
      "M256 224c-79.41 0-192 122.76-192 200.25 0 34.9 26.81 55.75 71.74 55.75 48.84 0 81.09-25.08 120.26-25.08 39.51 0 71.85 25.08 120.26 25.08 44.93 0 71.74-20.85 71.74-55.75C448 346.76 335.41 224 256 224zm-147.28-12.61c-10.4-34.65-42.44-57.09-71.56-50.13-29.12 6.96-44.29 40.69-33.89 75.34 10.4 34.65 42.44 57.09 71.56 50.13 29.12-6.96 44.29-40.69 33.89-75.34zm84.72-20.78c30.94-8.14 46.42-49.94 34.58-93.36s-46.52-72.01-77.46-63.87-46.42 49.94-34.58 93.36c11.84 43.42 46.53 72.02 77.46 63.87zm281.39-29.34c-29.12-6.96-61.15 15.48-71.56 50.13-10.4 34.65 4.77 68.38 33.89 75.34 29.12 6.96 61.15-15.48 71.56-50.13 10.4-34.65-4.77-68.38-33.89-75.34zm-156.27 29.34c30.94 8.14 65.62-20.45 77.46-63.87 11.84-43.42-3.64-85.21-34.58-93.36s-65.62 20.45-77.46 63.87c-11.84 43.42 3.64 85.22 34.58 93.36z",
    ],
  };

  bunker(function () {
    defineIcons("fas", icons);
  });
})();
(function () {
  "use strict";

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj &&
          typeof Symbol === "function" &&
          obj.constructor === Symbol &&
          obj !== Symbol.prototype
          ? "symbol"
          : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true,
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      var ownKeys = Object.keys(source);

      if (typeof Object.getOwnPropertySymbols === "function") {
        ownKeys = ownKeys.concat(
          Object.getOwnPropertySymbols(source).filter(function (sym) {
            return Object.getOwnPropertyDescriptor(source, sym).enumerable;
          })
        );
      }

      ownKeys.forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    }

    return target;
  }

  function _slicedToArray(arr, i) {
    return (
      _arrayWithHoles(arr) ||
      _iterableToArrayLimit(arr, i) ||
      _nonIterableRest()
    );
  }

  function _toConsumableArray(arr) {
    return (
      _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread()
    );
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++)
        arr2[i] = arr[i];

      return arr2;
    }
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArray(iter) {
    if (
      Symbol.iterator in Object(iter) ||
      Object.prototype.toString.call(iter) === "[object Arguments]"
    )
      return Array.from(iter);
  }

  function _iterableToArrayLimit(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (
        var _i = arr[Symbol.iterator](), _s;
        !(_n = (_s = _i.next()).done);
        _n = true
      ) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }

  var noop = function noop() { };

  var _WINDOW = {};
  var _DOCUMENT = {};
  var _MUTATION_OBSERVER = null;
  var _PERFORMANCE = {
    mark: noop,
    measure: noop,
  };

  try {
    if (typeof window !== "undefined") _WINDOW = window;
    if (typeof document !== "undefined") _DOCUMENT = document;
    if (typeof MutationObserver !== "undefined")
      _MUTATION_OBSERVER = MutationObserver;
    if (typeof performance !== "undefined") _PERFORMANCE = performance;
  } catch (e) { }

  var _ref = _WINDOW.navigator || {},
    _ref$userAgent = _ref.userAgent,
    userAgent = _ref$userAgent === void 0 ? "" : _ref$userAgent;

  var WINDOW = _WINDOW;
  var DOCUMENT = _DOCUMENT;
  var MUTATION_OBSERVER = _MUTATION_OBSERVER;
  var PERFORMANCE = _PERFORMANCE;
  var IS_BROWSER = !!WINDOW.document;
  var IS_DOM =
    !!DOCUMENT.documentElement &&
    !!DOCUMENT.head &&
    typeof DOCUMENT.addEventListener === "function" &&
    typeof DOCUMENT.createElement === "function";
  var IS_IE = ~userAgent.indexOf("MSIE") || ~userAgent.indexOf("Trident/");

  var NAMESPACE_IDENTIFIER = "___FONT_AWESOME___";
  var UNITS_IN_GRID = 16;
  var DEFAULT_FAMILY_PREFIX = "fa";
  var DEFAULT_REPLACEMENT_CLASS = "svg-inline--fa";
  var DATA_FA_I2SVG = "data-fa-i2svg";
  var DATA_FA_PSEUDO_ELEMENT = "data-fa-pseudo-element";
  var DATA_FA_PSEUDO_ELEMENT_PENDING = "data-fa-pseudo-element-pending";
  var DATA_PREFIX = "data-prefix";
  var DATA_ICON = "data-icon";
  var HTML_CLASS_I2SVG_BASE_CLASS = "fontawesome-i2svg";
  var MUTATION_APPROACH_ASYNC = "async";
  var TAGNAMES_TO_SKIP_FOR_PSEUDOELEMENTS = ["HTML", "HEAD", "STYLE", "SCRIPT"];
  var PRODUCTION = (function () {
    try {
      return "production" === "production";
    } catch (e) {
      return false;
    }
  })();
  var PREFIX_TO_STYLE = {
    fas: "solid",
    far: "regular",
    fal: "light",
    fad: "duotone",
    fab: "brands",
    fa: "solid",
  };
  var STYLE_TO_PREFIX = {
    solid: "fas",
    regular: "far",
    light: "fal",
    duotone: "fad",
    brands: "fab",
  };
  var LAYERS_TEXT_CLASSNAME = "fa-layers-text";
  var FONT_FAMILY_PATTERN =
    /Font Awesome 5 (Solid|Regular|Light|Duotone|Brands|Free|Pro)/;
  var FONT_WEIGHT_TO_PREFIX = {
    900: "fas",
    400: "far",
    normal: "far",
    300: "fal",
  };
  var oneToTen = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  var oneToTwenty = oneToTen.concat([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  var ATTRIBUTES_WATCHED_FOR_MUTATION = [
    "class",
    "data-prefix",
    "data-icon",
    "data-fa-transform",
    "data-fa-mask",
  ];
  var DUOTONE_CLASSES = {
    GROUP: "group",
    SWAP_OPACITY: "swap-opacity",
    PRIMARY: "primary",
    SECONDARY: "secondary",
  };
  var RESERVED_CLASSES = [
    "xs",
    "sm",
    "lg",
    "fw",
    "ul",
    "li",
    "border",
    "pull-left",
    "pull-right",
    "spin",
    "pulse",
    "rotate-90",
    "rotate-180",
    "rotate-270",
    "flip-horizontal",
    "flip-vertical",
    "flip-both",
    "stack",
    "stack-1x",
    "stack-2x",
    "inverse",
    "layers",
    "layers-text",
    "layers-counter",
    DUOTONE_CLASSES.GROUP,
    DUOTONE_CLASSES.SWAP_OPACITY,
    DUOTONE_CLASSES.PRIMARY,
    DUOTONE_CLASSES.SECONDARY,
  ]
    .concat(
      oneToTen.map(function (n) {
        return "".concat(n, "x");
      })
    )
    .concat(
      oneToTwenty.map(function (n) {
        return "w-".concat(n);
      })
    );

  var initial = WINDOW.FontAwesomeConfig || {};

  function getAttrConfig(attr) {
    var element = DOCUMENT.querySelector("script[" + attr + "]");

    if (element) {
      return element.getAttribute(attr);
    }
  }

  function coerce(val) {
    // Getting an empty string will occur if the attribute is set on the HTML tag but without a value
    // We'll assume that this is an indication that it should be toggled to true
    // For example <script data-search-pseudo-elements src="..."></script>
    if (val === "") return true;
    if (val === "false") return false;
    if (val === "true") return true;
    return val;
  }

  if (DOCUMENT && typeof DOCUMENT.querySelector === "function") {
    var attrs = [
      ["data-family-prefix", "familyPrefix"],
      ["data-replacement-class", "replacementClass"],
      ["data-auto-replace-svg", "autoReplaceSvg"],
      ["data-auto-add-css", "autoAddCss"],
      ["data-auto-a11y", "autoA11y"],
      ["data-search-pseudo-elements", "searchPseudoElements"],
      ["data-observe-mutations", "observeMutations"],
      ["data-mutate-approach", "mutateApproach"],
      ["data-keep-original-source", "keepOriginalSource"],
      ["data-measure-performance", "measurePerformance"],
      ["data-show-missing-icons", "showMissingIcons"],
    ];
    attrs.forEach(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
        attr = _ref2[0],
        key = _ref2[1];

      var val = coerce(getAttrConfig(attr));

      if (val !== undefined && val !== null) {
        initial[key] = val;
      }
    });
  }

  var _default = {
    familyPrefix: DEFAULT_FAMILY_PREFIX,
    replacementClass: DEFAULT_REPLACEMENT_CLASS,
    autoReplaceSvg: true,
    autoAddCss: true,
    autoA11y: true,
    searchPseudoElements: false,
    observeMutations: true,
    mutateApproach: "async",
    keepOriginalSource: true,
    measurePerformance: false,
    showMissingIcons: true,
  };

  var _config = _objectSpread({}, _default, initial);

  if (!_config.autoReplaceSvg) _config.observeMutations = false;

  var config = _objectSpread({}, _config);

  WINDOW.FontAwesomeConfig = config;

  var w = WINDOW || {};
  if (!w[NAMESPACE_IDENTIFIER]) w[NAMESPACE_IDENTIFIER] = {};
  if (!w[NAMESPACE_IDENTIFIER].styles) w[NAMESPACE_IDENTIFIER].styles = {};
  if (!w[NAMESPACE_IDENTIFIER].hooks) w[NAMESPACE_IDENTIFIER].hooks = {};
  if (!w[NAMESPACE_IDENTIFIER].shims) w[NAMESPACE_IDENTIFIER].shims = [];
  var namespace = w[NAMESPACE_IDENTIFIER];

  var functions = [];

  var listener = function listener() {
    DOCUMENT.removeEventListener("DOMContentLoaded", listener);
    loaded = 1;
    functions.map(function (fn) {
      return fn();
    });
  };

  var loaded = false;

  if (IS_DOM) {
    loaded = (
      DOCUMENT.documentElement.doScroll ? /^loaded|^c/ : /^loaded|^i|^c/
    ).test(DOCUMENT.readyState);
    if (!loaded) DOCUMENT.addEventListener("DOMContentLoaded", listener);
  }

  function domready(fn) {
    if (!IS_DOM) return;
    loaded ? setTimeout(fn, 0) : functions.push(fn);
  }

  var PENDING = "pending";
  var SETTLED = "settled";
  var FULFILLED = "fulfilled";
  var REJECTED = "rejected";

  var NOOP = function NOOP() { };

  var isNode =
    typeof global !== "undefined" &&
    typeof global.process !== "undefined" &&
    typeof global.process.emit === "function";
  var asyncSetTimer =
    typeof setImmediate === "undefined" ? setTimeout : setImmediate;
  var asyncQueue = [];
  var asyncTimer;

  function asyncFlush() {
    // run promise callbacks
    for (var i = 0; i < asyncQueue.length; i++) {
      asyncQueue[i][0](asyncQueue[i][1]);
    } // reset async asyncQueue

    asyncQueue = [];
    asyncTimer = false;
  }

  function asyncCall(callback, arg) {
    asyncQueue.push([callback, arg]);

    if (!asyncTimer) {
      asyncTimer = true;
      asyncSetTimer(asyncFlush, 0);
    }
  }

  function invokeResolver(resolver, promise) {
    function resolvePromise(value) {
      resolve(promise, value);
    }

    function rejectPromise(reason) {
      reject(promise, reason);
    }

    try {
      resolver(resolvePromise, rejectPromise);
    } catch (e) {
      rejectPromise(e);
    }
  }

  function invokeCallback(subscriber) {
    var owner = subscriber.owner;
    var settled = owner._state;
    var value = owner._data;
    var callback = subscriber[settled];
    var promise = subscriber.then;

    if (typeof callback === "function") {
      settled = FULFILLED;

      try {
        value = callback(value);
      } catch (e) {
        reject(promise, e);
      }
    }

    if (!handleThenable(promise, value)) {
      if (settled === FULFILLED) {
        resolve(promise, value);
      }

      if (settled === REJECTED) {
        reject(promise, value);
      }
    }
  }

  function handleThenable(promise, value) {
    var resolved;

    try {
      if (promise === value) {
        throw new TypeError(
          "A promises callback cannot return that same promise."
        );
      }

      if (
        value &&
        (typeof value === "function" || _typeof(value) === "object")
      ) {
        // then should be retrieved only once
        var then = value.then;

        if (typeof then === "function") {
          then.call(
            value,
            function (val) {
              if (!resolved) {
                resolved = true;

                if (value === val) {
                  fulfill(promise, val);
                } else {
                  resolve(promise, val);
                }
              }
            },
            function (reason) {
              if (!resolved) {
                resolved = true;
                reject(promise, reason);
              }
            }
          );
          return true;
        }
      }
    } catch (e) {
      if (!resolved) {
        reject(promise, e);
      }

      return true;
    }

    return false;
  }

  function resolve(promise, value) {
    if (promise === value || !handleThenable(promise, value)) {
      fulfill(promise, value);
    }
  }

  function fulfill(promise, value) {
    if (promise._state === PENDING) {
      promise._state = SETTLED;
      promise._data = value;
      asyncCall(publishFulfillment, promise);
    }
  }

  function reject(promise, reason) {
    if (promise._state === PENDING) {
      promise._state = SETTLED;
      promise._data = reason;
      asyncCall(publishRejection, promise);
    }
  }

  function publish(promise) {
    promise._then = promise._then.forEach(invokeCallback);
  }

  function publishFulfillment(promise) {
    promise._state = FULFILLED;
    publish(promise);
  }

  function publishRejection(promise) {
    promise._state = REJECTED;
    publish(promise);

    if (!promise._handled && isNode) {
      global.process.emit("unhandledRejection", promise._data, promise);
    }
  }

  function notifyRejectionHandled(promise) {
    global.process.emit("rejectionHandled", promise);
  }
  function P(resolver) {
    if (typeof resolver !== "function") {
      throw new TypeError(
        "Promise resolver " + resolver + " is not a function"
      );
    }

    if (this instanceof P === false) {
      throw new TypeError(
        "Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function."
      );
    }

    this._then = [];
    invokeResolver(resolver, this);
  }

  P.prototype = {
    constructor: P,
    _state: PENDING,
    _then: null,
    _data: undefined,
    _handled: false,
    then: function then(onFulfillment, onRejection) {
      var subscriber = {
        owner: this,
        then: new this.constructor(NOOP),
        fulfilled: onFulfillment,
        rejected: onRejection,
      };

      if ((onRejection || onFulfillment) && !this._handled) {
        this._handled = true;

        if (this._state === REJECTED && isNode) {
          asyncCall(notifyRejectionHandled, this);
        }
      }

      if (this._state === FULFILLED || this._state === REJECTED) {
        // already resolved, call callback async
        asyncCall(invokeCallback, subscriber);
      } else {
        // subscribe
        this._then.push(subscriber);
      }

      return subscriber.then;
    },
    catch: function _catch(onRejection) {
      return this.then(null, onRejection);
    },
  };

  P.all = function (promises) {
    if (!Array.isArray(promises)) {
      throw new TypeError("You must pass an array to Promise.all().");
    }

    return new P(function (resolve, reject) {
      var results = [];
      var remaining = 0;

      function resolver(index) {
        remaining++;
        return function (value) {
          results[index] = value;

          if (!--remaining) {
            resolve(results);
          }
        };
      }

      for (var i = 0, promise; i < promises.length; i++) {
        promise = promises[i];

        if (promise && typeof promise.then === "function") {
          promise.then(resolver(i), reject);
        } else {
          results[i] = promise;
        }
      }

      if (!remaining) {
        resolve(results);
      }
    });
  };

  P.race = function (promises) {
    if (!Array.isArray(promises)) {
      throw new TypeError("You must pass an array to Promise.race().");
    }

    return new P(function (resolve, reject) {
      for (var i = 0, promise; i < promises.length; i++) {
        promise = promises[i];

        if (promise && typeof promise.then === "function") {
          promise.then(resolve, reject);
        } else {
          resolve(promise);
        }
      }
    });
  };

  P.resolve = function (value) {
    if (value && _typeof(value) === "object" && value.constructor === P) {
      return value;
    }

    return new P(function (resolve) {
      resolve(value);
    });
  };

  P.reject = function (reason) {
    return new P(function (resolve, reject) {
      reject(reason);
    });
  };

  var picked = typeof Promise === "function" ? Promise : P;

  var d = UNITS_IN_GRID;
  var meaninglessTransform = {
    size: 16,
    x: 0,
    y: 0,
    rotate: 0,
    flipX: false,
    flipY: false,
  };

  function isReserved(name) {
    return ~RESERVED_CLASSES.indexOf(name);
  }

  function bunker(fn) {
    try {
      fn();
    } catch (e) {
      if (!PRODUCTION) {
        throw e;
      }
    }
  }
  function insertCss(css) {
    if (!css || !IS_DOM) {
      return;
    }

    var style = DOCUMENT.createElement("style");
    style.setAttribute("type", "text/css");
    style.innerHTML = css;
    var headChildren = DOCUMENT.head.childNodes;
    var beforeChild = null;

    for (var i = headChildren.length - 1; i > -1; i--) {
      var child = headChildren[i];
      var tagName = (child.tagName || "").toUpperCase();

      if (["STYLE", "LINK"].indexOf(tagName) > -1) {
        beforeChild = child;
      }
    }

    DOCUMENT.head.insertBefore(style, beforeChild);
    return css;
  }
  var idPool = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  function nextUniqueId() {
    var size = 12;
    var id = "";

    while (size-- > 0) {
      id += idPool[(Math.random() * 62) | 0];
    }

    return id;
  }
  function toArray(obj) {
    var array = [];

    for (var i = (obj || []).length >>> 0; i--;) {
      array[i] = obj[i];
    }

    return array;
  }
  function classArray(node) {
    if (node.classList) {
      return toArray(node.classList);
    } else {
      return (node.getAttribute("class") || "").split(" ").filter(function (i) {
        return i;
      });
    }
  }
  function getIconName(familyPrefix, cls) {
    var parts = cls.split("-");
    var prefix = parts[0];
    var iconName = parts.slice(1).join("-");

    if (prefix === familyPrefix && iconName !== "" && !isReserved(iconName)) {
      return iconName;
    } else {
      return null;
    }
  }
  function htmlEscape(str) {
    return ""
      .concat(str)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
  function joinAttributes(attributes) {
    return Object.keys(attributes || {})
      .reduce(function (acc, attributeName) {
        return (
          acc +
          ""
            .concat(attributeName, '="')
            .concat(htmlEscape(attributes[attributeName]), '" ')
        );
      }, "")
      .trim();
  }
  function joinStyles(styles) {
    return Object.keys(styles || {}).reduce(function (acc, styleName) {
      return acc + "".concat(styleName, ": ").concat(styles[styleName], ";");
    }, "");
  }
  function transformIsMeaningful(transform) {
    return (
      transform.size !== meaninglessTransform.size ||
      transform.x !== meaninglessTransform.x ||
      transform.y !== meaninglessTransform.y ||
      transform.rotate !== meaninglessTransform.rotate ||
      transform.flipX ||
      transform.flipY
    );
  }
  function transformForSvg(_ref) {
    var transform = _ref.transform,
      containerWidth = _ref.containerWidth,
      iconWidth = _ref.iconWidth;
    var outer = {
      transform: "translate(".concat(containerWidth / 2, " 256)"),
    };
    var innerTranslate = "translate("
      .concat(transform.x * 32, ", ")
      .concat(transform.y * 32, ") ");
    var innerScale = "scale("
      .concat((transform.size / 16) * (transform.flipX ? -1 : 1), ", ")
      .concat((transform.size / 16) * (transform.flipY ? -1 : 1), ") ");
    var innerRotate = "rotate(".concat(transform.rotate, " 0 0)");
    var inner = {
      transform: ""
        .concat(innerTranslate, " ")
        .concat(innerScale, " ")
        .concat(innerRotate),
    };
    var path = {
      transform: "translate(".concat((iconWidth / 2) * -1, " -256)"),
    };
    return {
      outer: outer,
      inner: inner,
      path: path,
    };
  }
  function transformForCss(_ref2) {
    var transform = _ref2.transform,
      _ref2$width = _ref2.width,
      width = _ref2$width === void 0 ? UNITS_IN_GRID : _ref2$width,
      _ref2$height = _ref2.height,
      height = _ref2$height === void 0 ? UNITS_IN_GRID : _ref2$height,
      _ref2$startCentered = _ref2.startCentered,
      startCentered =
        _ref2$startCentered === void 0 ? false : _ref2$startCentered;
    var val = "";

    if (startCentered && IS_IE) {
      val += "translate("
        .concat(transform.x / d - width / 2, "em, ")
        .concat(transform.y / d - height / 2, "em) ");
    } else if (startCentered) {
      val += "translate(calc(-50% + "
        .concat(transform.x / d, "em), calc(-50% + ")
        .concat(transform.y / d, "em)) ");
    } else {
      val += "translate("
        .concat(transform.x / d, "em, ")
        .concat(transform.y / d, "em) ");
    }

    val += "scale("
      .concat((transform.size / d) * (transform.flipX ? -1 : 1), ", ")
      .concat((transform.size / d) * (transform.flipY ? -1 : 1), ") ");
    val += "rotate(".concat(transform.rotate, "deg) ");
    return val;
  }

  var ALL_SPACE = {
    x: 0,
    y: 0,
    width: "100%",
    height: "100%",
  };

  function fillBlack(abstract) {
    var force =
      arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

    if (abstract.attributes && (abstract.attributes.fill || force)) {
      abstract.attributes.fill = "black";
    }

    return abstract;
  }

  function deGroup(abstract) {
    if (abstract.tag === "g") {
      return abstract.children;
    } else {
      return [abstract];
    }
  }

  function makeIconMasking(_ref) {
    var children = _ref.children,
      attributes = _ref.attributes,
      main = _ref.main,
      mask = _ref.mask,
      transform = _ref.transform;
    var mainWidth = main.width,
      mainPath = main.icon;
    var maskWidth = mask.width,
      maskPath = mask.icon;
    var trans = transformForSvg({
      transform: transform,
      containerWidth: maskWidth,
      iconWidth: mainWidth,
    });
    var maskRect = {
      tag: "rect",
      attributes: _objectSpread({}, ALL_SPACE, {
        fill: "white",
      }),
    };
    var maskInnerGroupChildrenMixin = mainPath.children
      ? {
        children: mainPath.children.map(fillBlack),
      }
      : {};
    var maskInnerGroup = {
      tag: "g",
      attributes: _objectSpread({}, trans.inner),
      children: [
        fillBlack(
          _objectSpread(
            {
              tag: mainPath.tag,
              attributes: _objectSpread({}, mainPath.attributes, trans.path),
            },
            maskInnerGroupChildrenMixin
          )
        ),
      ],
    };
    var maskOuterGroup = {
      tag: "g",
      attributes: _objectSpread({}, trans.outer),
      children: [maskInnerGroup],
    };
    var maskId = "mask-".concat(nextUniqueId());
    var clipId = "clip-".concat(nextUniqueId());
    var maskTag = {
      tag: "mask",
      attributes: _objectSpread({}, ALL_SPACE, {
        id: maskId,
        maskUnits: "userSpaceOnUse",
        maskContentUnits: "userSpaceOnUse",
      }),
      children: [maskRect, maskOuterGroup],
    };
    var defs = {
      tag: "defs",
      children: [
        {
          tag: "clipPath",
          attributes: {
            id: clipId,
          },
          children: deGroup(maskPath),
        },
        maskTag,
      ],
    };
    children.push(defs, {
      tag: "rect",
      attributes: _objectSpread(
        {
          fill: "currentColor",
          "clip-path": "url(#".concat(clipId, ")"),
          mask: "url(#".concat(maskId, ")"),
        },
        ALL_SPACE
      ),
    });
    return {
      children: children,
      attributes: attributes,
    };
  }

  function makeIconStandard(_ref) {
    var children = _ref.children,
      attributes = _ref.attributes,
      main = _ref.main,
      transform = _ref.transform,
      styles = _ref.styles;
    var styleString = joinStyles(styles);

    if (styleString.length > 0) {
      attributes["style"] = styleString;
    }

    if (transformIsMeaningful(transform)) {
      var trans = transformForSvg({
        transform: transform,
        containerWidth: main.width,
        iconWidth: main.width,
      });
      children.push({
        tag: "g",
        attributes: _objectSpread({}, trans.outer),
        children: [
          {
            tag: "g",
            attributes: _objectSpread({}, trans.inner),
            children: [
              {
                tag: main.icon.tag,
                children: main.icon.children,
                attributes: _objectSpread({}, main.icon.attributes, trans.path),
              },
            ],
          },
        ],
      });
    } else {
      children.push(main.icon);
    }

    return {
      children: children,
      attributes: attributes,
    };
  }

  function asIcon(_ref) {
    var children = _ref.children,
      main = _ref.main,
      mask = _ref.mask,
      attributes = _ref.attributes,
      styles = _ref.styles,
      transform = _ref.transform;

    if (transformIsMeaningful(transform) && main.found && !mask.found) {
      var width = main.width,
        height = main.height;
      var offset = {
        x: width / height / 2,
        y: 0.5,
      };
      attributes["style"] = joinStyles(
        _objectSpread({}, styles, {
          "transform-origin": ""
            .concat(offset.x + transform.x / 16, "em ")
            .concat(offset.y + transform.y / 16, "em"),
        })
      );
    }

    return [
      {
        tag: "svg",
        attributes: attributes,
        children: children,
      },
    ];
  }

  function asSymbol(_ref) {
    var prefix = _ref.prefix,
      iconName = _ref.iconName,
      children = _ref.children,
      attributes = _ref.attributes,
      symbol = _ref.symbol;
    var id =
      symbol === true
        ? ""
          .concat(prefix, "-")
          .concat(config.familyPrefix, "-")
          .concat(iconName)
        : symbol;
    return [
      {
        tag: "svg",
        attributes: {
          style: "display: none;",
        },
        children: [
          {
            tag: "symbol",
            attributes: _objectSpread({}, attributes, {
              id: id,
            }),
            children: children,
          },
        ],
      },
    ];
  }

  function makeInlineSvgAbstract(params) {
    var _params$icons = params.icons,
      main = _params$icons.main,
      mask = _params$icons.mask,
      prefix = params.prefix,
      iconName = params.iconName,
      transform = params.transform,
      symbol = params.symbol,
      title = params.title,
      extra = params.extra,
      _params$watchable = params.watchable,
      watchable = _params$watchable === void 0 ? false : _params$watchable;

    var _ref = mask.found ? mask : main,
      width = _ref.width,
      height = _ref.height;

    var widthClass = "fa-w-".concat(Math.ceil((width / height) * 16));
    var attrClass = [
      config.replacementClass,
      iconName ? "".concat(config.familyPrefix, "-").concat(iconName) : "",
      widthClass,
    ]
      .filter(function (c) {
        return extra.classes.indexOf(c) === -1;
      })
      .concat(extra.classes)
      .join(" ");
    var content = {
      children: [],
      attributes: _objectSpread({}, extra.attributes, {
        "data-prefix": prefix,
        "data-icon": iconName,
        class: attrClass,
        role: extra.attributes.role || "img",
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 ".concat(width, " ").concat(height),
      }),
    };

    if (watchable) {
      content.attributes[DATA_FA_I2SVG] = "";
    }

    if (title)
      content.children.push({
        tag: "title",
        attributes: {
          id:
            content.attributes["aria-labelledby"] ||
            "title-".concat(nextUniqueId()),
        },
        children: [title],
      });

    var args = _objectSpread({}, content, {
      prefix: prefix,
      iconName: iconName,
      main: main,
      mask: mask,
      transform: transform,
      symbol: symbol,
      styles: extra.styles,
    });

    var _ref2 =
      mask.found && main.found
        ? makeIconMasking(args)
        : makeIconStandard(args),
      children = _ref2.children,
      attributes = _ref2.attributes;

    args.children = children;
    args.attributes = attributes;

    if (symbol) {
      return asSymbol(args);
    } else {
      return asIcon(args);
    }
  }
  function makeLayersTextAbstract(params) {
    var content = params.content,
      width = params.width,
      height = params.height,
      transform = params.transform,
      title = params.title,
      extra = params.extra,
      _params$watchable2 = params.watchable,
      watchable = _params$watchable2 === void 0 ? false : _params$watchable2;

    var attributes = _objectSpread(
      {},
      extra.attributes,
      title
        ? {
          title: title,
        }
        : {},
      {
        class: extra.classes.join(" "),
      }
    );

    if (watchable) {
      attributes[DATA_FA_I2SVG] = "";
    }

    var styles = _objectSpread({}, extra.styles);

    if (transformIsMeaningful(transform)) {
      styles["transform"] = transformForCss({
        transform: transform,
        startCentered: true,
        width: width,
        height: height,
      });
      styles["-webkit-transform"] = styles["transform"];
    }

    var styleString = joinStyles(styles);

    if (styleString.length > 0) {
      attributes["style"] = styleString;
    }

    var val = [];
    val.push({
      tag: "span",
      attributes: attributes,
      children: [content],
    });

    if (title) {
      val.push({
        tag: "span",
        attributes: {
          class: "sr-only",
        },
        children: [title],
      });
    }

    return val;
  }
  function makeLayersCounterAbstract(params) {
    var content = params.content,
      title = params.title,
      extra = params.extra;

    var attributes = _objectSpread(
      {},
      extra.attributes,
      title
        ? {
          title: title,
        }
        : {},
      {
        class: extra.classes.join(" "),
      }
    );

    var styleString = joinStyles(extra.styles);

    if (styleString.length > 0) {
      attributes["style"] = styleString;
    }

    var val = [];
    val.push({
      tag: "span",
      attributes: attributes,
      children: [content],
    });

    if (title) {
      val.push({
        tag: "span",
        attributes: {
          class: "sr-only",
        },
        children: [title],
      });
    }

    return val;
  }

  var noop$1 = function noop() { };

  var p =
    config.measurePerformance &&
      PERFORMANCE &&
      PERFORMANCE.mark &&
      PERFORMANCE.measure
      ? PERFORMANCE
      : {
        mark: noop$1,
        measure: noop$1,
      };
  var preamble = 'FA "5.11.2"';

  var begin = function begin(name) {
    p.mark("".concat(preamble, " ").concat(name, " begins"));
    return function () {
      return end(name);
    };
  };

  var end = function end(name) {
    p.mark("".concat(preamble, " ").concat(name, " ends"));
    p.measure(
      "".concat(preamble, " ").concat(name),
      "".concat(preamble, " ").concat(name, " begins"),
      "".concat(preamble, " ").concat(name, " ends")
    );
  };

  var perf = {
    begin: begin,
    end: end,
  };

  /**
   * Internal helper to bind a function known to have 4 arguments
   * to a given context.
   */

  var bindInternal4 = function bindInternal4(func, thisContext) {
    return function (a, b, c, d) {
      return func.call(thisContext, a, b, c, d);
    };
  };

  /**
   * # Reduce
   *
   * A fast object `.reduce()` implementation.
   *
   * @param  {Object}   subject      The object to reduce over.
   * @param  {Function} fn           The reducer function.
   * @param  {mixed}    initialValue The initial value for the reducer, defaults to subject[0].
   * @param  {Object}   thisContext  The context for the reducer.
   * @return {mixed}                 The final result.
   */

  var reduce = function fastReduceObject(
    subject,
    fn,
    initialValue,
    thisContext
  ) {
    var keys = Object.keys(subject),
      length = keys.length,
      iterator =
        thisContext !== undefined ? bindInternal4(fn, thisContext) : fn,
      i,
      key,
      result;

    if (initialValue === undefined) {
      i = 1;
      result = subject[keys[0]];
    } else {
      i = 0;
      result = initialValue;
    }

    for (; i < length; i++) {
      key = keys[i];
      result = iterator(result, subject[key], key, subject);
    }

    return result;
  };

  function toHex(unicode) {
    var result = "";

    for (var i = 0; i < unicode.length; i++) {
      var hex = unicode.charCodeAt(i).toString(16);
      result += ("000" + hex).slice(-4);
    }

    return result;
  }

  function defineIcons(prefix, icons) {
    var params =
      arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var _params$skipHooks = params.skipHooks,
      skipHooks = _params$skipHooks === void 0 ? false : _params$skipHooks;
    var normalized = Object.keys(icons).reduce(function (acc, iconName) {
      var icon = icons[iconName];
      var expanded = !!icon.icon;

      if (expanded) {
        acc[icon.iconName] = icon.icon;
      } else {
        acc[iconName] = icon;
      }

      return acc;
    }, {});

    if (typeof namespace.hooks.addPack === "function" && !skipHooks) {
      namespace.hooks.addPack(prefix, normalized);
    } else {
      namespace.styles[prefix] = _objectSpread(
        {},
        namespace.styles[prefix] || {},
        normalized
      );
    }
    /**
     * Font Awesome 4 used the prefix of `fa` for all icons. With the introduction
     * of new styles we needed to differentiate between them. Prefix `fa` is now an alias
     * for `fas` so we'll easy the upgrade process for our users by automatically defining
     * this as well.
     */
    if (prefix === "fas") {
      defineIcons("fa", icons);
    }
  }

  var styles = namespace.styles,
    shims = namespace.shims;
  var _byUnicode = {};
  var _byLigature = {};
  var _byOldName = {};
  var build = function build() {
    var lookup = function lookup(reducer) {
      return reduce(
        styles,
        function (o, style, prefix) {
          o[prefix] = reduce(style, reducer, {});
          return o;
        },
        {}
      );
    };

    _byUnicode = lookup(function (acc, icon, iconName) {
      if (icon[3]) {
        acc[icon[3]] = iconName;
      }

      return acc;
    });
    _byLigature = lookup(function (acc, icon, iconName) {
      var ligatures = icon[2];
      acc[iconName] = iconName;
      ligatures.forEach(function (ligature) {
        acc[ligature] = iconName;
      });
      return acc;
    });
    var hasRegular = "far" in styles;
    _byOldName = reduce(
      shims,
      function (acc, shim) {
        var oldName = shim[0];
        var prefix = shim[1];
        var iconName = shim[2];

        if (prefix === "far" && !hasRegular) {
          prefix = "fas";
        }

        acc[oldName] = {
          prefix: prefix,
          iconName: iconName,
        };
        return acc;
      },
      {}
    );
  };
  build();
  function byUnicode(prefix, unicode) {
    return (_byUnicode[prefix] || {})[unicode];
  }
  function byLigature(prefix, ligature) {
    return (_byLigature[prefix] || {})[ligature];
  }
  function byOldName(name) {
    return (
      _byOldName[name] || {
        prefix: null,
        iconName: null,
      }
    );
  }

  var styles$1 = namespace.styles;
  var emptyCanonicalIcon = function emptyCanonicalIcon() {
    return {
      prefix: null,
      iconName: null,
      rest: [],
    };
  };
  function getCanonicalIcon(values) {
    return values.reduce(function (acc, cls) {
      var iconName = getIconName(config.familyPrefix, cls);

      if (styles$1[cls]) {
        acc.prefix = cls;
      } else if (
        config.autoFetchSvg &&
        ["fas", "far", "fal", "fad", "fab", "fa"].indexOf(cls) > -1
      ) {
        acc.prefix = cls;
      } else if (iconName) {
        var shim = acc.prefix === "fa" ? byOldName(iconName) : {};
        acc.iconName = shim.iconName || iconName;
        acc.prefix = shim.prefix || acc.prefix;
      } else if (
        cls !== config.replacementClass &&
        cls.indexOf("fa-w-") !== 0
      ) {
        acc.rest.push(cls);
      }

      return acc;
    }, emptyCanonicalIcon());
  }
  function iconFromMapping(mapping, prefix, iconName) {
    if (mapping && mapping[prefix] && mapping[prefix][iconName]) {
      return {
        prefix: prefix,
        iconName: iconName,
        icon: mapping[prefix][iconName],
      };
    }
  }

  function toHtml(abstractNodes) {
    var tag = abstractNodes.tag,
      _abstractNodes$attrib = abstractNodes.attributes,
      attributes =
        _abstractNodes$attrib === void 0 ? {} : _abstractNodes$attrib,
      _abstractNodes$childr = abstractNodes.children,
      children = _abstractNodes$childr === void 0 ? [] : _abstractNodes$childr;

    if (typeof abstractNodes === "string") {
      return htmlEscape(abstractNodes);
    } else {
      return "<"
        .concat(tag, " ")
        .concat(joinAttributes(attributes), ">")
        .concat(children.map(toHtml).join(""), "</")
        .concat(tag, ">");
    }
  }

  var noop$2 = function noop() { };

  function isWatched(node) {
    var i2svg = node.getAttribute ? node.getAttribute(DATA_FA_I2SVG) : null;
    return typeof i2svg === "string";
  }

  function getMutator() {
    if (config.autoReplaceSvg === true) {
      return mutators.replace;
    }

    var mutator = mutators[config.autoReplaceSvg];
    return mutator || mutators.replace;
  }

  var mutators = {
    replace: function replace(mutation) {
      var node = mutation[0];
      var abstract = mutation[1];
      var newOuterHTML = abstract
        .map(function (a) {
          return toHtml(a);
        })
        .join("\n");

      if (node.parentNode && node.outerHTML) {
        node.outerHTML =
          newOuterHTML +
          (config.keepOriginalSource && node.tagName.toLowerCase() !== "svg"
            ? "<!-- ".concat(node.outerHTML, " -->")
            : "");
      } else if (node.parentNode) {
        var newNode = document.createElement("span");
        node.parentNode.replaceChild(newNode, node);
        newNode.outerHTML = newOuterHTML;
      }
    },
    nest: function nest(mutation) {
      var node = mutation[0];
      var abstract = mutation[1]; // If we already have a replaced node we do not want to continue nesting within it.
      // Short-circuit to the standard replacement

      if (~classArray(node).indexOf(config.replacementClass)) {
        return mutators.replace(mutation);
      }

      var forSvg = new RegExp("".concat(config.familyPrefix, "-.*"));
      delete abstract[0].attributes.style;
      delete abstract[0].attributes.id;
      var splitClasses = abstract[0].attributes.class.split(" ").reduce(
        function (acc, cls) {
          if (cls === config.replacementClass || cls.match(forSvg)) {
            acc.toSvg.push(cls);
          } else {
            acc.toNode.push(cls);
          }

          return acc;
        },
        {
          toNode: [],
          toSvg: [],
        }
      );
      abstract[0].attributes.class = splitClasses.toSvg.join(" ");
      var newInnerHTML = abstract
        .map(function (a) {
          return toHtml(a);
        })
        .join("\n");
      node.setAttribute("class", splitClasses.toNode.join(" "));
      node.setAttribute(DATA_FA_I2SVG, "");
      node.innerHTML = newInnerHTML;
    },
  };

  function performOperationSync(op) {
    op();
  }

  function perform(mutations, callback) {
    var callbackFunction = typeof callback === "function" ? callback : noop$2;

    if (mutations.length === 0) {
      callbackFunction();
    } else {
      var frame = performOperationSync;

      if (config.mutateApproach === MUTATION_APPROACH_ASYNC) {
        frame = WINDOW.requestAnimationFrame || performOperationSync;
      }

      frame(function () {
        var mutator = getMutator();
        var mark = perf.begin("mutate");
        mutations.map(mutator);
        mark();
        callbackFunction();
      });
    }
  }
  var disabled = false;
  function disableObservation() {
    disabled = true;
  }
  function enableObservation() {
    disabled = false;
  }
  var mo = null;
  function observe(options) {
    if (!MUTATION_OBSERVER) {
      return;
    }

    if (!config.observeMutations) {
      return;
    }

    var treeCallback = options.treeCallback,
      nodeCallback = options.nodeCallback,
      pseudoElementsCallback = options.pseudoElementsCallback,
      _options$observeMutat = options.observeMutationsRoot,
      observeMutationsRoot =
        _options$observeMutat === void 0 ? DOCUMENT : _options$observeMutat;
    mo = new MUTATION_OBSERVER(function (objects) {
      if (disabled) return;
      toArray(objects).forEach(function (mutationRecord) {
        if (
          mutationRecord.type === "childList" &&
          mutationRecord.addedNodes.length > 0 &&
          !isWatched(mutationRecord.addedNodes[0])
        ) {
          if (config.searchPseudoElements) {
            pseudoElementsCallback(mutationRecord.target);
          }

          treeCallback(mutationRecord.target);
        }

        if (
          mutationRecord.type === "attributes" &&
          mutationRecord.target.parentNode &&
          config.searchPseudoElements
        ) {
          pseudoElementsCallback(mutationRecord.target.parentNode);
        }

        if (
          mutationRecord.type === "attributes" &&
          isWatched(mutationRecord.target) &&
          ~ATTRIBUTES_WATCHED_FOR_MUTATION.indexOf(mutationRecord.attributeName)
        ) {
          if (mutationRecord.attributeName === "class") {
            var _getCanonicalIcon = getCanonicalIcon(
              classArray(mutationRecord.target)
            ),
              prefix = _getCanonicalIcon.prefix,
              iconName = _getCanonicalIcon.iconName;

            if (prefix)
              mutationRecord.target.setAttribute("data-prefix", prefix);
            if (iconName)
              mutationRecord.target.setAttribute("data-icon", iconName);
          } else {
            nodeCallback(mutationRecord.target);
          }
        }
      });
    });
    if (!IS_DOM) return;
    mo.observe(observeMutationsRoot, {
      childList: true,
      attributes: true,
      characterData: true,
      subtree: true,
    });
  }
  function disconnect() {
    if (!mo) return;
    mo.disconnect();
  }

  function styleParser(node) {
    var style = node.getAttribute("style");
    var val = [];

    if (style) {
      val = style.split(";").reduce(function (acc, style) {
        var styles = style.split(":");
        var prop = styles[0];
        var value = styles.slice(1);

        if (prop && value.length > 0) {
          acc[prop] = value.join(":").trim();
        }

        return acc;
      }, {});
    }

    return val;
  }

  function classParser(node) {
    var existingPrefix = node.getAttribute("data-prefix");
    var existingIconName = node.getAttribute("data-icon");
    var innerText = node.innerText !== undefined ? node.innerText.trim() : "";
    var val = getCanonicalIcon(classArray(node));

    if (existingPrefix && existingIconName) {
      val.prefix = existingPrefix;
      val.iconName = existingIconName;
    }

    if (val.prefix && innerText.length > 1) {
      val.iconName = byLigature(val.prefix, node.innerText);
    } else if (val.prefix && innerText.length === 1) {
      val.iconName = byUnicode(val.prefix, toHex(node.innerText));
    }

    return val;
  }

  var parseTransformString = function parseTransformString(transformString) {
    var transform = {
      size: 16,
      x: 0,
      y: 0,
      flipX: false,
      flipY: false,
      rotate: 0,
    };

    if (!transformString) {
      return transform;
    } else {
      return transformString
        .toLowerCase()
        .split(" ")
        .reduce(function (acc, n) {
          var parts = n.toLowerCase().split("-");
          var first = parts[0];
          var rest = parts.slice(1).join("-");

          if (first && rest === "h") {
            acc.flipX = true;
            return acc;
          }

          if (first && rest === "v") {
            acc.flipY = true;
            return acc;
          }

          rest = parseFloat(rest);

          if (isNaN(rest)) {
            return acc;
          }

          switch (first) {
            case "grow":
              acc.size = acc.size + rest;
              break;

            case "shrink":
              acc.size = acc.size - rest;
              break;

            case "left":
              acc.x = acc.x - rest;
              break;

            case "right":
              acc.x = acc.x + rest;
              break;

            case "up":
              acc.y = acc.y - rest;
              break;

            case "down":
              acc.y = acc.y + rest;
              break;

            case "rotate":
              acc.rotate = acc.rotate + rest;
              break;
          }

          return acc;
        }, transform);
    }
  };
  function transformParser(node) {
    return parseTransformString(node.getAttribute("data-fa-transform"));
  }

  function symbolParser(node) {
    var symbol = node.getAttribute("data-fa-symbol");
    return symbol === null ? false : symbol === "" ? true : symbol;
  }

  function attributesParser(node) {
    var extraAttributes = toArray(node.attributes).reduce(function (acc, attr) {
      if (acc.name !== "class" && acc.name !== "style") {
        acc[attr.name] = attr.value;
      }

      return acc;
    }, {});
    var title = node.getAttribute("title");

    if (config.autoA11y) {
      if (title) {
        extraAttributes["aria-labelledby"] = ""
          .concat(config.replacementClass, "-title-")
          .concat(nextUniqueId());
      } else {
        extraAttributes["aria-hidden"] = "true";
        extraAttributes["focusable"] = "false";
      }
    }

    return extraAttributes;
  }

  function maskParser(node) {
    var mask = node.getAttribute("data-fa-mask");

    if (!mask) {
      return emptyCanonicalIcon();
    } else {
      return getCanonicalIcon(
        mask.split(" ").map(function (i) {
          return i.trim();
        })
      );
    }
  }

  function blankMeta() {
    return {
      iconName: null,
      title: null,
      prefix: null,
      transform: meaninglessTransform,
      symbol: false,
      mask: null,
      extra: {
        classes: [],
        styles: {},
        attributes: {},
      },
    };
  }
  function parseMeta(node) {
    var _classParser = classParser(node),
      iconName = _classParser.iconName,
      prefix = _classParser.prefix,
      extraClasses = _classParser.rest;

    var extraStyles = styleParser(node);
    var transform = transformParser(node);
    var symbol = symbolParser(node);
    var extraAttributes = attributesParser(node);
    var mask = maskParser(node);
    return {
      iconName: iconName,
      title: node.getAttribute("title"),
      prefix: prefix,
      transform: transform,
      symbol: symbol,
      mask: mask,
      extra: {
        classes: extraClasses,
        styles: extraStyles,
        attributes: extraAttributes,
      },
    };
  }

  function MissingIcon(error) {
    this.name = "MissingIcon";
    this.message = error || "Icon unavailable";
    this.stack = new Error().stack;
  }
  MissingIcon.prototype = Object.create(Error.prototype);
  MissingIcon.prototype.constructor = MissingIcon;

  var FILL = {
    fill: "currentColor",
  };
  var ANIMATION_BASE = {
    attributeType: "XML",
    repeatCount: "indefinite",
    dur: "2s",
  };
  var RING = {
    tag: "path",
    attributes: _objectSpread({}, FILL, {
      d: "M156.5,447.7l-12.6,29.5c-18.7-9.5-35.9-21.2-51.5-34.9l22.7-22.7C127.6,430.5,141.5,440,156.5,447.7z M40.6,272H8.5 c1.4,21.2,5.4,41.7,11.7,61.1L50,321.2C45.1,305.5,41.8,289,40.6,272z M40.6,240c1.4-18.8,5.2-37,11.1-54.1l-29.5-12.6 C14.7,194.3,10,216.7,8.5,240H40.6z M64.3,156.5c7.8-14.9,17.2-28.8,28.1-41.5L69.7,92.3c-13.7,15.6-25.5,32.8-34.9,51.5 L64.3,156.5z M397,419.6c-13.9,12-29.4,22.3-46.1,30.4l11.9,29.8c20.7-9.9,39.8-22.6,56.9-37.6L397,419.6z M115,92.4 c13.9-12,29.4-22.3,46.1-30.4l-11.9-29.8c-20.7,9.9-39.8,22.6-56.8,37.6L115,92.4z M447.7,355.5c-7.8,14.9-17.2,28.8-28.1,41.5 l22.7,22.7c13.7-15.6,25.5-32.9,34.9-51.5L447.7,355.5z M471.4,272c-1.4,18.8-5.2,37-11.1,54.1l29.5,12.6 c7.5-21.1,12.2-43.5,13.6-66.8H471.4z M321.2,462c-15.7,5-32.2,8.2-49.2,9.4v32.1c21.2-1.4,41.7-5.4,61.1-11.7L321.2,462z M240,471.4c-18.8-1.4-37-5.2-54.1-11.1l-12.6,29.5c21.1,7.5,43.5,12.2,66.8,13.6V471.4z M462,190.8c5,15.7,8.2,32.2,9.4,49.2h32.1 c-1.4-21.2-5.4-41.7-11.7-61.1L462,190.8z M92.4,397c-12-13.9-22.3-29.4-30.4-46.1l-29.8,11.9c9.9,20.7,22.6,39.8,37.6,56.9 L92.4,397z M272,40.6c18.8,1.4,36.9,5.2,54.1,11.1l12.6-29.5C317.7,14.7,295.3,10,272,8.5V40.6z M190.8,50 c15.7-5,32.2-8.2,49.2-9.4V8.5c-21.2,1.4-41.7,5.4-61.1,11.7L190.8,50z M442.3,92.3L419.6,115c12,13.9,22.3,29.4,30.5,46.1 l29.8-11.9C470,128.5,457.3,109.4,442.3,92.3z M397,92.4l22.7-22.7c-15.6-13.7-32.8-25.5-51.5-34.9l-12.6,29.5 C370.4,72.1,384.4,81.5,397,92.4z",
    }),
  };

  var OPACITY_ANIMATE = _objectSpread({}, ANIMATION_BASE, {
    attributeName: "opacity",
  });

  var DOT = {
    tag: "circle",
    attributes: _objectSpread({}, FILL, {
      cx: "256",
      cy: "364",
      r: "28",
    }),
    children: [
      {
        tag: "animate",
        attributes: _objectSpread({}, ANIMATION_BASE, {
          attributeName: "r",
          values: "28;14;28;28;14;28;",
        }),
      },
      {
        tag: "animate",
        attributes: _objectSpread({}, OPACITY_ANIMATE, {
          values: "1;0;1;1;0;1;",
        }),
      },
    ],
  };
  var QUESTION = {
    tag: "path",
    attributes: _objectSpread({}, FILL, {
      opacity: "1",
      d: "M263.7,312h-16c-6.6,0-12-5.4-12-12c0-71,77.4-63.9,77.4-107.8c0-20-17.8-40.2-57.4-40.2c-29.1,0-44.3,9.6-59.2,28.7 c-3.9,5-11.1,6-16.2,2.4l-13.1-9.2c-5.6-3.9-6.9-11.8-2.6-17.2c21.2-27.2,46.4-44.7,91.2-44.7c52.3,0,97.4,29.8,97.4,80.2 c0,67.6-77.4,63.5-77.4,107.8C275.7,306.6,270.3,312,263.7,312z",
    }),
    children: [
      {
        tag: "animate",
        attributes: _objectSpread({}, OPACITY_ANIMATE, {
          values: "1;0;0;0;0;1;",
        }),
      },
    ],
  };
  var EXCLAMATION = {
    tag: "path",
    attributes: _objectSpread({}, FILL, {
      opacity: "0",
      d: "M232.5,134.5l7,168c0.3,6.4,5.6,11.5,12,11.5h9c6.4,0,11.7-5.1,12-11.5l7-168c0.3-6.8-5.2-12.5-12-12.5h-23 C237.7,122,232.2,127.7,232.5,134.5z",
    }),
    children: [
      {
        tag: "animate",
        attributes: _objectSpread({}, OPACITY_ANIMATE, {
          values: "0;0;1;1;0;0;",
        }),
      },
    ],
  };
  var missing = {
    tag: "g",
    children: [RING, DOT, QUESTION, EXCLAMATION],
  };

  var styles$2 = namespace.styles;
  function asFoundIcon(icon) {
    var width = icon[0];
    var height = icon[1];

    var _icon$slice = icon.slice(4),
      _icon$slice2 = _slicedToArray(_icon$slice, 1),
      vectorData = _icon$slice2[0];

    var element = null;

    if (Array.isArray(vectorData)) {
      element = {
        tag: "g",
        attributes: {
          class: ""
            .concat(config.familyPrefix, "-")
            .concat(DUOTONE_CLASSES.GROUP),
        },
        children: [
          {
            tag: "path",
            attributes: {
              class: ""
                .concat(config.familyPrefix, "-")
                .concat(DUOTONE_CLASSES.SECONDARY),
              fill: "currentColor",
              d: vectorData[0],
            },
          },
          {
            tag: "path",
            attributes: {
              class: ""
                .concat(config.familyPrefix, "-")
                .concat(DUOTONE_CLASSES.PRIMARY),
              fill: "currentColor",
              d: vectorData[1],
            },
          },
        ],
      };
    } else {
      element = {
        tag: "path",
        attributes: {
          fill: "currentColor",
          d: vectorData,
        },
      };
    }

    return {
      found: true,
      width: width,
      height: height,
      icon: element,
    };
  }
  function findIcon(iconName, prefix) {
    return new picked(function (resolve, reject) {
      var val = {
        found: false,
        width: 512,
        height: 512,
        icon: missing,
      };

      if (
        iconName &&
        prefix &&
        styles$2[prefix] &&
        styles$2[prefix][iconName]
      ) {
        var icon = styles$2[prefix][iconName];
        return resolve(asFoundIcon(icon));
      }

      var headers = {};

      if (
        _typeof(WINDOW.FontAwesomeKitConfig) === "object" &&
        typeof window.FontAwesomeKitConfig.token === "string"
      ) {
        headers["fa-kit-token"] = WINDOW.FontAwesomeKitConfig.token;
      }

      if (iconName && prefix && !config.showMissingIcons) {
        reject(
          new MissingIcon(
            "Icon is missing for prefix "
              .concat(prefix, " with icon name ")
              .concat(iconName)
          )
        );
      } else {
        resolve(val);
      }
    });
  }

  var styles$3 = namespace.styles;

  function generateSvgReplacementMutation(node, nodeMeta) {
    var iconName = nodeMeta.iconName,
      title = nodeMeta.title,
      prefix = nodeMeta.prefix,
      transform = nodeMeta.transform,
      symbol = nodeMeta.symbol,
      mask = nodeMeta.mask,
      extra = nodeMeta.extra;
    return new picked(function (resolve, reject) {
      picked
        .all([findIcon(iconName, prefix), findIcon(mask.iconName, mask.prefix)])
        .then(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 2),
            main = _ref2[0],
            mask = _ref2[1];

          resolve([
            node,
            makeInlineSvgAbstract({
              icons: {
                main: main,
                mask: mask,
              },
              prefix: prefix,
              iconName: iconName,
              transform: transform,
              symbol: symbol,
              mask: mask,
              title: title,
              extra: extra,
              watchable: true,
            }),
          ]);
        });
    });
  }

  function generateLayersText(node, nodeMeta) {
    var title = nodeMeta.title,
      transform = nodeMeta.transform,
      extra = nodeMeta.extra;
    var width = null;
    var height = null;

    if (IS_IE) {
      var computedFontSize = parseInt(getComputedStyle(node).fontSize, 10);
      var boundingClientRect = node.getBoundingClientRect();
      width = boundingClientRect.width / computedFontSize;
      height = boundingClientRect.height / computedFontSize;
    }

    if (config.autoA11y && !title) {
      extra.attributes["aria-hidden"] = "true";
    }

    return picked.resolve([
      node,
      makeLayersTextAbstract({
        content: node.innerHTML,
        width: width,
        height: height,
        transform: transform,
        title: title,
        extra: extra,
        watchable: true,
      }),
    ]);
  }

  function generateMutation(node) {
    var nodeMeta = parseMeta(node);

    if (~nodeMeta.extra.classes.indexOf(LAYERS_TEXT_CLASSNAME)) {
      return generateLayersText(node, nodeMeta);
    } else {
      return generateSvgReplacementMutation(node, nodeMeta);
    }
  }

  function onTree(root) {
    var callback =
      arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    if (!IS_DOM) return;
    var htmlClassList = DOCUMENT.documentElement.classList;

    var hclAdd = function hclAdd(suffix) {
      return htmlClassList.add(
        "".concat(HTML_CLASS_I2SVG_BASE_CLASS, "-").concat(suffix)
      );
    };

    var hclRemove = function hclRemove(suffix) {
      return htmlClassList.remove(
        "".concat(HTML_CLASS_I2SVG_BASE_CLASS, "-").concat(suffix)
      );
    };

    var prefixes = config.autoFetchSvg
      ? Object.keys(PREFIX_TO_STYLE)
      : Object.keys(styles$3);
    var prefixesDomQuery = [
      ".".concat(LAYERS_TEXT_CLASSNAME, ":not([").concat(DATA_FA_I2SVG, "])"),
    ]
      .concat(
        prefixes.map(function (p) {
          return ".".concat(p, ":not([").concat(DATA_FA_I2SVG, "])");
        })
      )
      .join(", ");

    if (prefixesDomQuery.length === 0) {
      return;
    }

    var candidates = [];

    try {
      candidates = toArray(root.querySelectorAll(prefixesDomQuery));
    } catch (e) {
      // noop
    }

    if (candidates.length > 0) {
      hclAdd("pending");
      hclRemove("complete");
    } else {
      return;
    }

    var mark = perf.begin("onTree");
    var mutations = candidates.reduce(function (acc, node) {
      try {
        var mutation = generateMutation(node);

        if (mutation) {
          acc.push(mutation);
        }
      } catch (e) {
        if (!PRODUCTION) {
          if (e instanceof MissingIcon) {
            console.error(e);
          }
        }
      }

      return acc;
    }, []);
    return new picked(function (resolve, reject) {
      picked
        .all(mutations)
        .then(function (resolvedMutations) {
          perform(resolvedMutations, function () {
            hclAdd("active");
            hclAdd("complete");
            hclRemove("pending");
            if (typeof callback === "function") callback();
            mark();
            resolve();
          });
        })
        .catch(function () {
          mark();
          reject();
        });
    });
  }
  function onNode(node) {
    var callback =
      arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    generateMutation(node).then(function (mutation) {
      if (mutation) {
        perform([mutation], callback);
      }
    });
  }

  function replaceForPosition(node, position) {
    var pendingAttribute = ""
      .concat(DATA_FA_PSEUDO_ELEMENT_PENDING)
      .concat(position.replace(":", "-"));
    return new picked(function (resolve, reject) {
      if (node.getAttribute(pendingAttribute) !== null) {
        // This node is already being processed
        return resolve();
      }

      var children = toArray(node.children);
      var alreadyProcessedPseudoElement = children.filter(function (c) {
        return c.getAttribute(DATA_FA_PSEUDO_ELEMENT) === position;
      })[0];
      var styles = WINDOW.getComputedStyle(node, position);
      var fontFamily = styles
        .getPropertyValue("font-family")
        .match(FONT_FAMILY_PATTERN);
      var fontWeight = styles.getPropertyValue("font-weight");

      if (alreadyProcessedPseudoElement && !fontFamily) {
        // If we've already processed it but the current computed style does not result in a font-family,
        // that probably means that a class name that was previously present to make the icon has been
        // removed. So we now should delete the icon.
        node.removeChild(alreadyProcessedPseudoElement);
        return resolve();
      } else if (fontFamily) {
        var content = styles.getPropertyValue("content");
        var prefix = ~[
          "Solid",
          "Regular",
          "Light",
          "Duotone",
          "Brands",
        ].indexOf(fontFamily[1])
          ? STYLE_TO_PREFIX[fontFamily[1].toLowerCase()]
          : FONT_WEIGHT_TO_PREFIX[fontWeight];
        var hexValue = toHex(
          content.length === 3 ? content.substr(1, 1) : content
        );
        var iconName = byUnicode(prefix, hexValue);
        var iconIdentifier = iconName; // Only convert the pseudo element in this :before/:after position into an icon if we haven't
        // already done so with the same prefix and iconName

        if (
          iconName &&
          (!alreadyProcessedPseudoElement ||
            alreadyProcessedPseudoElement.getAttribute(DATA_PREFIX) !==
            prefix ||
            alreadyProcessedPseudoElement.getAttribute(DATA_ICON) !==
            iconIdentifier)
        ) {
          node.setAttribute(pendingAttribute, iconIdentifier);

          if (alreadyProcessedPseudoElement) {
            // Delete the old one, since we're replacing it with a new one
            node.removeChild(alreadyProcessedPseudoElement);
          }

          var meta = blankMeta();
          var extra = meta.extra;
          extra.attributes[DATA_FA_PSEUDO_ELEMENT] = position;
          findIcon(iconName, prefix)
            .then(function (main) {
              var abstract = makeInlineSvgAbstract(
                _objectSpread({}, meta, {
                  icons: {
                    main: main,
                    mask: emptyCanonicalIcon(),
                  },
                  prefix: prefix,
                  iconName: iconIdentifier,
                  extra: extra,
                  watchable: true,
                })
              );
              var element = DOCUMENT.createElement("svg");

              if (position === ":before") {
                node.insertBefore(element, node.firstChild);
              } else {
                node.appendChild(element);
              }

              element.outerHTML = abstract
                .map(function (a) {
                  return toHtml(a);
                })
                .join("\n");
              node.removeAttribute(pendingAttribute);
              resolve();
            })
            .catch(reject);
        } else {
          resolve();
        }
      } else {
        resolve();
      }
    });
  }

  function replace(node) {
    return picked.all([
      replaceForPosition(node, ":before"),
      replaceForPosition(node, ":after"),
    ]);
  }

  function processable(node) {
    return (
      node.parentNode !== document.head &&
      !~TAGNAMES_TO_SKIP_FOR_PSEUDOELEMENTS.indexOf(
        node.tagName.toUpperCase()
      ) &&
      !node.getAttribute(DATA_FA_PSEUDO_ELEMENT) &&
      (!node.parentNode || node.parentNode.tagName !== "svg")
    );
  }

  function searchPseudoElements(root) {
    if (!IS_DOM) return;
    return new picked(function (resolve, reject) {
      var operations = toArray(root.querySelectorAll("*"))
        .filter(processable)
        .map(replace);
      var end = perf.begin("searchPseudoElements");
      disableObservation();
      picked
        .all(operations)
        .then(function () {
          end();
          enableObservation();
          resolve();
        })
        .catch(function () {
          end();
          enableObservation();
          reject();
        });
    });
  }

  var baseStyles =
    "svg:not(:root).svg-inline--fa{overflow:visible}.svg-inline--fa{display:inline-block;font-size:inherit;height:1em;overflow:visible;vertical-align:-.125em}.svg-inline--fa.fa-lg{vertical-align:-.225em}.svg-inline--fa.fa-w-1{width:.0625em}.svg-inline--fa.fa-w-2{width:.125em}.svg-inline--fa.fa-w-3{width:.1875em}.svg-inline--fa.fa-w-4{width:.25em}.svg-inline--fa.fa-w-5{width:.3125em}.svg-inline--fa.fa-w-6{width:.375em}.svg-inline--fa.fa-w-7{width:.4375em}.svg-inline--fa.fa-w-8{width:.5em}.svg-inline--fa.fa-w-9{width:.5625em}.svg-inline--fa.fa-w-10{width:.625em}.svg-inline--fa.fa-w-11{width:.6875em}.svg-inline--fa.fa-w-12{width:.75em}.svg-inline--fa.fa-w-13{width:.8125em}.svg-inline--fa.fa-w-14{width:.875em}.svg-inline--fa.fa-w-15{width:.9375em}.svg-inline--fa.fa-w-16{width:1em}.svg-inline--fa.fa-w-17{width:1.0625em}.svg-inline--fa.fa-w-18{width:1.125em}.svg-inline--fa.fa-w-19{width:1.1875em}.svg-inline--fa.fa-w-20{width:1.25em}.svg-inline--fa.fa-pull-left{margin-right:.3em;width:auto}.svg-inline--fa.fa-pull-right{margin-left:.3em;width:auto}.svg-inline--fa.fa-border{height:1.5em}.svg-inline--fa.fa-li{width:2em}.svg-inline--fa.fa-fw{width:1.25em}.fa-layers svg.svg-inline--fa{bottom:0;left:0;margin:auto;position:absolute;right:0;top:0}.fa-layers{display:inline-block;height:1em;position:relative;text-align:center;vertical-align:-.125em;width:1em}.fa-layers svg.svg-inline--fa{-webkit-transform-origin:center center;transform-origin:center center}.fa-layers-counter,.fa-layers-text{display:inline-block;position:absolute;text-align:center}.fa-layers-text{left:50%;top:50%;-webkit-transform:translate(-50%,-50%);transform:translate(-50%,-50%);-webkit-transform-origin:center center;transform-origin:center center}.fa-layers-counter{background-color:#ff253a;border-radius:1em;-webkit-box-sizing:border-box;box-sizing:border-box;color:#fff;height:1.5em;line-height:1;max-width:5em;min-width:1.5em;overflow:hidden;padding:.25em;right:0;text-overflow:ellipsis;top:0;-webkit-transform:scale(.25);transform:scale(.25);-webkit-transform-origin:top right;transform-origin:top right}.fa-layers-bottom-right{bottom:0;right:0;top:auto;-webkit-transform:scale(.25);transform:scale(.25);-webkit-transform-origin:bottom right;transform-origin:bottom right}.fa-layers-bottom-left{bottom:0;left:0;right:auto;top:auto;-webkit-transform:scale(.25);transform:scale(.25);-webkit-transform-origin:bottom left;transform-origin:bottom left}.fa-layers-top-right{right:0;top:0;-webkit-transform:scale(.25);transform:scale(.25);-webkit-transform-origin:top right;transform-origin:top right}.fa-layers-top-left{left:0;right:auto;top:0;-webkit-transform:scale(.25);transform:scale(.25);-webkit-transform-origin:top left;transform-origin:top left}.fa-lg{font-size:1.3333333333em;line-height:.75em;vertical-align:-.0667em}.fa-xs{font-size:.75em}.fa-sm{font-size:.875em}.fa-1x{font-size:1em}.fa-2x{font-size:2em}.fa-3x{font-size:3em}.fa-4x{font-size:4em}.fa-5x{font-size:5em}.fa-6x{font-size:6em}.fa-7x{font-size:7em}.fa-8x{font-size:8em}.fa-9x{font-size:9em}.fa-10x{font-size:10em}.fa-fw{text-align:center;width:1.25em}.fa-ul{list-style-type:none;margin-left:2.5em;padding-left:0}.fa-ul>li{position:relative}.fa-li{left:-2em;position:absolute;text-align:center;width:2em;line-height:inherit}.fa-border{border:solid .08em #eee;border-radius:.1em;padding:.2em .25em .15em}.fa-pull-left{float:left}.fa-pull-right{float:right}.fa.fa-pull-left,.fab.fa-pull-left,.fal.fa-pull-left,.far.fa-pull-left,.fas.fa-pull-left{margin-right:.3em}.fa.fa-pull-right,.fab.fa-pull-right,.fal.fa-pull-right,.far.fa-pull-right,.fas.fa-pull-right{margin-left:.3em}.fa-spin{-webkit-animation:fa-spin 2s infinite linear;animation:fa-spin 2s infinite linear}.fa-pulse{-webkit-animation:fa-spin 1s infinite steps(8);animation:fa-spin 1s infinite steps(8)}@-webkit-keyframes fa-spin{0%{-webkit-transform:rotate(0);transform:rotate(0)}100%{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}@keyframes fa-spin{0%{-webkit-transform:rotate(0);transform:rotate(0)}100%{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}.fa-rotate-90{-webkit-transform:rotate(90deg);transform:rotate(90deg)}.fa-rotate-180{-webkit-transform:rotate(180deg);transform:rotate(180deg)}.fa-rotate-270{-webkit-transform:rotate(270deg);transform:rotate(270deg)}.fa-flip-horizontal{-webkit-transform:scale(-1,1);transform:scale(-1,1)}.fa-flip-vertical{-webkit-transform:scale(1,-1);transform:scale(1,-1)}.fa-flip-both,.fa-flip-horizontal.fa-flip-vertical{-webkit-transform:scale(-1,-1);transform:scale(-1,-1)}:root .fa-flip-both,:root .fa-flip-horizontal,:root .fa-flip-vertical,:root .fa-rotate-180,:root .fa-rotate-270,:root .fa-rotate-90{-webkit-filter:none;filter:none}.fa-stack{display:inline-block;height:2em;position:relative;width:2.5em}.fa-stack-1x,.fa-stack-2x{bottom:0;left:0;margin:auto;position:absolute;right:0;top:0}.svg-inline--fa.fa-stack-1x{height:1em;width:1.25em}.svg-inline--fa.fa-stack-2x{height:2em;width:2.5em}.fa-inverse{color:#fff}.sr-only{border:0;clip:rect(0,0,0,0);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}.sr-only-focusable:active,.sr-only-focusable:focus{clip:auto;height:auto;margin:0;overflow:visible;position:static;width:auto}.svg-inline--fa .fa-primary{fill:var(--fa-primary-color,currentColor);opacity:1;opacity:var(--fa-primary-opacity,1)}.svg-inline--fa .fa-secondary{fill:var(--fa-secondary-color,currentColor);opacity:.4;opacity:var(--fa-secondary-opacity,.4)}.svg-inline--fa.fa-swap-opacity .fa-primary{opacity:.4;opacity:var(--fa-secondary-opacity,.4)}.svg-inline--fa.fa-swap-opacity .fa-secondary{opacity:1;opacity:var(--fa-primary-opacity,1)}.svg-inline--fa mask .fa-primary,.svg-inline--fa mask .fa-secondary{fill:#000}.fad.fa-inverse{color:#fff}";

  function css() {
    var dfp = DEFAULT_FAMILY_PREFIX;
    var drc = DEFAULT_REPLACEMENT_CLASS;
    var fp = config.familyPrefix;
    var rc = config.replacementClass;
    var s = baseStyles;

    if (fp !== dfp || rc !== drc) {
      var dPatt = new RegExp("\\.".concat(dfp, "\\-"), "g");
      var customPropPatt = new RegExp("\\--".concat(dfp, "\\-"), "g");
      var rPatt = new RegExp("\\.".concat(drc), "g");
      s = s
        .replace(dPatt, ".".concat(fp, "-"))
        .replace(customPropPatt, "--".concat(fp, "-"))
        .replace(rPatt, ".".concat(rc));
    }

    return s;
  }

  var Library =
    /*#__PURE__*/
    (function () {
      function Library() {
        _classCallCheck(this, Library);

        this.definitions = {};
      }

      _createClass(Library, [
        {
          key: "add",
          value: function add() {
            var _this = this;

            for (
              var _len = arguments.length,
              definitions = new Array(_len),
              _key = 0;
              _key < _len;
              _key++
            ) {
              definitions[_key] = arguments[_key];
            }

            var additions = definitions.reduce(this._pullDefinitions, {});
            Object.keys(additions).forEach(function (key) {
              _this.definitions[key] = _objectSpread(
                {},
                _this.definitions[key] || {},
                additions[key]
              );
              defineIcons(key, additions[key]);
              build();
            });
          },
        },
        {
          key: "reset",
          value: function reset() {
            this.definitions = {};
          },
        },
        {
          key: "_pullDefinitions",
          value: function _pullDefinitions(additions, definition) {
            var normalized =
              definition.prefix && definition.iconName && definition.icon
                ? {
                  0: definition,
                }
                : definition;
            Object.keys(normalized).map(function (key) {
              var _normalized$key = normalized[key],
                prefix = _normalized$key.prefix,
                iconName = _normalized$key.iconName,
                icon = _normalized$key.icon;
              if (!additions[prefix]) additions[prefix] = {};
              additions[prefix][iconName] = icon;
            });
            return additions;
          },
        },
      ]);

      return Library;
    })();

  function ensureCss() {
    if (config.autoAddCss && !_cssInserted) {
      insertCss(css());

      _cssInserted = true;
    }
  }

  function apiObject(val, abstractCreator) {
    Object.defineProperty(val, "abstract", {
      get: abstractCreator,
    });
    Object.defineProperty(val, "html", {
      get: function get() {
        return val.abstract.map(function (a) {
          return toHtml(a);
        });
      },
    });
    Object.defineProperty(val, "node", {
      get: function get() {
        if (!IS_DOM) return;
        var container = DOCUMENT.createElement("div");
        container.innerHTML = val.html;
        return container.children;
      },
    });
    return val;
  }

  function findIconDefinition(iconLookup) {
    var _iconLookup$prefix = iconLookup.prefix,
      prefix = _iconLookup$prefix === void 0 ? "fa" : _iconLookup$prefix,
      iconName = iconLookup.iconName;
    if (!iconName) return;
    return (
      iconFromMapping(library.definitions, prefix, iconName) ||
      iconFromMapping(namespace.styles, prefix, iconName)
    );
  }

  function resolveIcons(next) {
    return function (maybeIconDefinition) {
      var params =
        arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var iconDefinition = (maybeIconDefinition || {}).icon
        ? maybeIconDefinition
        : findIconDefinition(maybeIconDefinition || {});
      var mask = params.mask;

      if (mask) {
        mask = (mask || {}).icon ? mask : findIconDefinition(mask || {});
      }

      return next(
        iconDefinition,
        _objectSpread({}, params, {
          mask: mask,
        })
      );
    };
  }

  var library = new Library();
  var noAuto = function noAuto() {
    config.autoReplaceSvg = false;
    config.observeMutations = false;
    disconnect();
  };
  var _cssInserted = false;
  var dom = {
    i2svg: function i2svg() {
      var params =
        arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (IS_DOM) {
        ensureCss();
        var _params$node = params.node,
          node = _params$node === void 0 ? DOCUMENT : _params$node,
          _params$callback = params.callback,
          callback =
            _params$callback === void 0 ? function () { } : _params$callback;

        if (config.searchPseudoElements) {
          searchPseudoElements(node);
        }

        return onTree(node, callback);
      } else {
        return picked.reject("Operation requires a DOM of some kind.");
      }
    },
    css: css,
    insertCss: function insertCss$$1() {
      if (!_cssInserted) {
        insertCss(css());

        _cssInserted = true;
      }
    },
    watch: function watch() {
      var params =
        arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var autoReplaceSvgRoot = params.autoReplaceSvgRoot,
        observeMutationsRoot = params.observeMutationsRoot;

      if (config.autoReplaceSvg === false) {
        config.autoReplaceSvg = true;
      }

      config.observeMutations = true;
      domready(function () {
        autoReplace({
          autoReplaceSvgRoot: autoReplaceSvgRoot,
        });
        observe({
          treeCallback: onTree,
          nodeCallback: onNode,
          pseudoElementsCallback: searchPseudoElements,
          observeMutationsRoot: observeMutationsRoot,
        });
      });
    },
  };
  var parse = {
    transform: function transform(transformString) {
      return parseTransformString(transformString);
    },
  };
  var icon = resolveIcons(function (iconDefinition) {
    var params =
      arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var _params$transform = params.transform,
      transform =
        _params$transform === void 0 ? meaninglessTransform : _params$transform,
      _params$symbol = params.symbol,
      symbol = _params$symbol === void 0 ? false : _params$symbol,
      _params$mask = params.mask,
      mask = _params$mask === void 0 ? null : _params$mask,
      _params$title = params.title,
      title = _params$title === void 0 ? null : _params$title,
      _params$classes = params.classes,
      classes = _params$classes === void 0 ? [] : _params$classes,
      _params$attributes = params.attributes,
      attributes = _params$attributes === void 0 ? {} : _params$attributes,
      _params$styles = params.styles,
      styles = _params$styles === void 0 ? {} : _params$styles;
    if (!iconDefinition) return;
    var prefix = iconDefinition.prefix,
      iconName = iconDefinition.iconName,
      icon = iconDefinition.icon;
    return apiObject(
      _objectSpread(
        {
          type: "icon",
        },
        iconDefinition
      ),
      function () {
        ensureCss();

        if (config.autoA11y) {
          if (title) {
            attributes["aria-labelledby"] = ""
              .concat(config.replacementClass, "-title-")
              .concat(nextUniqueId());
          } else {
            attributes["aria-hidden"] = "true";
            attributes["focusable"] = "false";
          }
        }

        return makeInlineSvgAbstract({
          icons: {
            main: asFoundIcon(icon),
            mask: mask
              ? asFoundIcon(mask.icon)
              : {
                found: false,
                width: null,
                height: null,
                icon: {},
              },
          },
          prefix: prefix,
          iconName: iconName,
          transform: _objectSpread({}, meaninglessTransform, transform),
          symbol: symbol,
          title: title,
          extra: {
            attributes: attributes,
            styles: styles,
            classes: classes,
          },
        });
      }
    );
  });
  var text = function text(content) {
    var params =
      arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var _params$transform2 = params.transform,
      transform =
        _params$transform2 === void 0
          ? meaninglessTransform
          : _params$transform2,
      _params$title2 = params.title,
      title = _params$title2 === void 0 ? null : _params$title2,
      _params$classes2 = params.classes,
      classes = _params$classes2 === void 0 ? [] : _params$classes2,
      _params$attributes2 = params.attributes,
      attributes = _params$attributes2 === void 0 ? {} : _params$attributes2,
      _params$styles2 = params.styles,
      styles = _params$styles2 === void 0 ? {} : _params$styles2;
    return apiObject(
      {
        type: "text",
        content: content,
      },
      function () {
        ensureCss();
        return makeLayersTextAbstract({
          content: content,
          transform: _objectSpread({}, meaninglessTransform, transform),
          title: title,
          extra: {
            attributes: attributes,
            styles: styles,
            classes: ["".concat(config.familyPrefix, "-layers-text")].concat(
              _toConsumableArray(classes)
            ),
          },
        });
      }
    );
  };
  var counter = function counter(content) {
    var params =
      arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var _params$title3 = params.title,
      title = _params$title3 === void 0 ? null : _params$title3,
      _params$classes3 = params.classes,
      classes = _params$classes3 === void 0 ? [] : _params$classes3,
      _params$attributes3 = params.attributes,
      attributes = _params$attributes3 === void 0 ? {} : _params$attributes3,
      _params$styles3 = params.styles,
      styles = _params$styles3 === void 0 ? {} : _params$styles3;
    return apiObject(
      {
        type: "counter",
        content: content,
      },
      function () {
        ensureCss();
        return makeLayersCounterAbstract({
          content: content.toString(),
          title: title,
          extra: {
            attributes: attributes,
            styles: styles,
            classes: ["".concat(config.familyPrefix, "-layers-counter")].concat(
              _toConsumableArray(classes)
            ),
          },
        });
      }
    );
  };
  var layer = function layer(assembler) {
    var params =
      arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var _params$classes4 = params.classes,
      classes = _params$classes4 === void 0 ? [] : _params$classes4;
    return apiObject(
      {
        type: "layer",
      },
      function () {
        ensureCss();
        var children = [];
        assembler(function (args) {
          Array.isArray(args)
            ? args.map(function (a) {
              children = children.concat(a.abstract);
            })
            : (children = children.concat(args.abstract));
        });
        return [
          {
            tag: "span",
            attributes: {
              class: ["".concat(config.familyPrefix, "-layers")]
                .concat(_toConsumableArray(classes))
                .join(" "),
            },
            children: children,
          },
        ];
      }
    );
  };
  var api = {
    noAuto: noAuto,
    config: config,
    dom: dom,
    library: library,
    parse: parse,
    findIconDefinition: findIconDefinition,
    icon: icon,
    text: text,
    counter: counter,
    layer: layer,
    toHtml: toHtml,
  };

  var autoReplace = function autoReplace() {
    var params =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var _params$autoReplaceSv = params.autoReplaceSvgRoot,
      autoReplaceSvgRoot =
        _params$autoReplaceSv === void 0 ? DOCUMENT : _params$autoReplaceSv;
    if (
      (Object.keys(namespace.styles).length > 0 || config.autoFetchSvg) &&
      IS_DOM &&
      config.autoReplaceSvg
    )
      api.dom.i2svg({
        node: autoReplaceSvgRoot,
      });
  };

  function bootstrap() {
    if (IS_BROWSER) {
      if (!WINDOW.FontAwesome) {
        WINDOW.FontAwesome = api;
      }

      domready(function () {
        autoReplace();
        observe({
          treeCallback: onTree,
          nodeCallback: onNode,
          pseudoElementsCallback: searchPseudoElements,
        });
      });
    }

    namespace.hooks = _objectSpread({}, namespace.hooks, {
      addPack: function addPack(prefix, icons) {
        namespace.styles[prefix] = _objectSpread(
          {},
          namespace.styles[prefix] || {},
          icons
        );
        build();
        autoReplace();
      },
      addShims: function addShims(shims) {
        var _namespace$shims;

        (_namespace$shims = namespace.shims).push.apply(
          _namespace$shims,
          _toConsumableArray(shims)
        );

        build();
        autoReplace();
      },
    });
  }

  bunker(bootstrap);
})();
