// 策略组
let strategies = {
  /**
   * 判断是否小于限定长度
   * @param {string} value - 输入值
   * @param {number} length - 最小长度
   * @param {string} invalidMsg - 错误提示信息
   * @returns 
   */
  minLength: function (value, length, invalidMsg) {
    if (value && value.length < length) {
      return invalidMsg;
    }
  },
  /**
   * 判断是否大于限定长度
   * @param {string} value - 输入值
   * @param {number} length - 最大长度
   * @param {string} invalidMsg - 错误提示信息
   * @returns 
   */
  maxLength: function (value, length, invalidMsg) {
    if (value && value.length > length) {
      return invalidMsg;
    }
  },
  /**
   * 判断是否满足非空字符串
   * @param {string} value - 输入值
   * @param {string} invalidMsg - 错误提示信息
   * @returns 
   */
  isNonEmpty: function (value, invalidMsg) {
    if (value === '') {
      return invalidMsg;
    }
  },
  /**
   * 判断是否满足整数
   * @param {string|number} value - 输入值
   * @param {string} invalidMsg - 错误提示信息
   * @returns 
   */
  isInteger: function (value, invalidMsg) {
    if (value !== '' && !/^[0-9]+$/.test(value)) {
      return invalidMsg;
    }
  },
  /**
   * 判断输入值是否满足密码要求，即：仅支持数字、字母、下划线
   * @param {string} value - 输入值
   * @param {string} invalidMsg - 错误提示信息
   * @returns 
   */
  isPassword: function (value, invalidMsg) {
    if (value !== '' && !/(^\w+$)/.test(value)) {
      return invalidMsg;
    }
  },
  /**
   * 判断输入值是否满足名字要求，即：仅支持汉字、数字、字母，不包含符号
   * @param {string} value - 输入值
   * @param {string} invalidMsg - 错误提示信息
   * @returns 
   */
  isName: function (value, invalidMsg) {
    if (value !== '' && !/^[\u4E00-\u9FA5\uf900-\ufa2d0-9a-zA-Z]+$/.test(value)) {
      return invalidMsg;
    }
  },
  /**
   * 判断是否满足网址链接，必须携带协议头，支持http、https、ipv4、ipv6
   * @param {string} value - 输入值
   * @param {string} invalidMsg - 错误提示信息
   * @returns 
   */
  isUrl: function (value, invalidMsg) {
    if (value !== '' && !/^((https?:\/\/)|(www\.))((([0-9]{1,3}\.){3}[0-9]{1,3})|localhost|(([a-zA-Z0-9\\-]+\.)+[a-zA-Z0-9]+)|(\[[0-9a-fA-F:]+\]))/.test(value)) {
      return invalidMsg;
    }
  },
  /**
   * 判断是否满足颜色代码要求，即：#fff、#000000、rgb(0,0,0)、rgba(0,0,0,0)
   * @param {string} value - 输入值
   * @param {string} invalidMsg - 错误提示信息
   * @returns 
   */
  isColor: function (value, invalidMsg) {
    if (value !== '' && !/^(#([0-9A-Fa-f]{3}){1,2}|rgb\(\d{1,3},\s*\d{1,3},\s*\d{1,3}\)|rgba\(\d{1,3},\s*\d{1,3},\s*\d{1,3},\s*(0(\.\d+)?|1(\.0+)?)\))$/.test(value)) {
      return invalidMsg;
    }
  },
  /**
   * 判断是否满足IP要求，即：localhost、ipv4
   * @param {string} value - 输入值
   * @param {string} invalidMsg - 错误提示信息
   * @returns 
   */
  isIp: function (value, errMsg) {
    if (value !== '' && !/^(localhost|([0-9]{1,3}\.){3}[0-9]{1,3})$/.test(value)) {
      return errMsg;
    }
  },
  /**
   * 判断是否满足邮箱要求
   * @param {string} value - 输入值
   * @param {string} invalidMsg - 错误提示信息
   * @returns 
   */
  isEmail: function (value, invalidMsg) {
    if (value !== '' && !/^[A-Za-z0-9]+([-._][A-Za-z0-9]+)*@[A-Za-z0-9]+(-[A-Za-z0-9]+)*(\.[A-Za-z]{2,6}|[A-Za-z]{2,4}\.[A-Za-z]{2,3})$/.test(value)) {
      return invalidMsg;
    }
  },
  /**
   * 判断是否JSON对象要求
   * @param {string} value - 输入值
   * @param {string} invalidMsg - 错误提示信息
   * @returns 
   */
  isJSONObject: function (value, invalidMsg) {
    try {
      if (value === '') return;
      let temp = JSON.parse(value);
      let flag = Object.prototype.toString.call(temp) === '[object Object]';
      if (!flag) return invalidMsg;
    } catch (error) {
      return invalidMsg;
    }
  },
  /**
   * 判断是否JSON数组要求
   * @param {string} value - 输入值
   * @param {string} invalidMsg - 错误提示信息
   * @returns 
   */
  isJSONArray: function (value, invalidMsg) {
    try {
      if (value === '') return;
      let temp = JSON.parse(value);
      let flag = Object.prototype.toString.call(temp) === '[object Array]';
      if (!flag) return invalidMsg;
    } catch (error) {
      return invalidMsg;
    }
  },
};

// 执行器
class Validator {
  constructor() {
    this.caches = [];
  }

  /**
   * 添加校验规则
   * @param {string} value - 校验值
   * @param {array} rules - 校验规则，格式：[{strategy, errMsg}]
   */
  add(value, rules) {
    rules.map(rule => {
      // 处理策略标识 支持minLength：5写法
      let strategyArr = rule.strategy.split(/:|：/); // 策略中携带判断值
      // 1.获取策略标识
      let strategy = strategyArr.shift(); // 头弹法
      // 2.压入校验的值
      strategyArr.unshift(value); // 头插入校验值
      // 3.压入错误提示
      strategyArr.push(rule.errMsg);
      this.caches.push(() => {
        return strategies[strategy].apply(this, strategyArr);
      });
    });
  }

  /**
   * 校验缓存区的规则
   * @returns {string} 错误提示信息
   */
  start() {
    for (let validatorFun of this.caches) {
      let errText = validatorFun();
      if (errText) {
        return errText;
      }
    }
  }

  /**
   * 多项校验
   * @param {array} list - 校验项列表，格式：[{value, rules: [{strategy, errMsg}]}]
   * @returns {string} 错误提示信息 
   */
  verify(list) {
    this.clear();
    for (let item of list) {
      let valid = new Validator();
      valid.add(item.value, item.rules);
      // 返回最新的错误信息
      let errText = valid.start();
      if (errText) {
        return errText;
      }
    }
  }

  /**
   * 获取 el-form 控件 rules 配置中 validator 验证规则
   * @param {array} strategyList - 校验策略规则数组 ['isNonEmpty::必填项']
   * @returns
   */
  getElementFormValidator(strategyList) {
    let rules = strategyList.map(item => {
      let temp = item.split('::');
      return {
        strategy: temp[0],
        errMsg: temp[1],
      };
    });
    let that = this
    return function (formRule, formItemValue, callback) {
      let errText = that.verify([
        {
          rules: rules,
          value: formItemValue,
        },
      ]);
      // 存在错误
      if (errText) {
        callback(new Error(errText));
      } else {
        callback();
      }
    };
  }

  clear() {
    this.caches = [];
  }
}

export { Validator, strategies };
