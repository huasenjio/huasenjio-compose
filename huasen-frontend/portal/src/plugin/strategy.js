// 策略组
let strategies = {
  isNoEmpty: function(value, errorMsg) {
    if (value === '') {
      return errorMsg;
    }
  },
  minLength: function(value, length, errorMsg) {
    if (value && value.length < length) {
      return errorMsg;
    }
  },
  maxLength: function(value, length, errorMsg) {
    if (value && value.length > length) {
      return errorMsg;
    }
  },

  // 数字字母下划线
  isPassword: function(value, errorMsg) {
    if (!/(^\w+$)/.test(value)) {
      return errorMsg;
    }
  },

  isMobile: function(value, errorMsg) {
    if (!/(^1[3|5|8][0-9]{9}$)/.test(value)) {
      return errorMsg;
    }
  },
  isNumber: function(value, errorMsg) {
    if (!/^\d*$/.test(value)) {
      return errorMsg;
    }
  },
  // 字母汉字数字（不包括任何符号）
  isChinese: function(value, errorMsg) {
    if (!/^[\u4E00-\u9FA5\uf900-\ufa2d0-9a-zA-Z]+$/.test(value)) {
      return errorMsg;
    }
  },
  // 姓名
  isName: function(value, errorMsg) {
    if (!/^([\u4E00-\u9FA5\uf900-\ufa2d0-9a-zA-Z]·?)*[\u4E00-\u9FA5\uf900-\ufa2d0-9a-zA-Z]$/.test(value)) {
      return errorMsg;
    }
  },
  // 网址链接
  isUrl: function(value, errorMsg) {
    if (!/^((https?:\/\/)|(www\.))((([0-9]{1,3}\.){3}[0-9]{1,3})|localhost|([a-zA-Z0-9\\-]+\.[a-zA-Z0-9]+)+)((\/[a-zA-Z0-9]*)+|(:\d+\/)|(\/#\/))/.test(value)) {
      return errorMsg;
    }
  },
  // 身份证校验
  isIDCard: function(value, errorMsg) {
    if (!/(^\d{15}$)|(^\d{17}(\d|X|x)$)/.test(value)) {
      return errorMsg;
    }
  },
  isPlateNumber: function(value, errorMsg) {
    if (!/^(([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z](([0-9]{5}[DF])|([DF]([A-HJ-NP-Z0-9])[0-9]{4})))|([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9挂学警港澳使领]))$/.test(value)) {
      return errorMsg;
    }
  },
  isEmail: function(value, errorMsg) {
    if (!/^(([^()[\]\\.,;:\s@\\"]+(\.[^()[\]\\.,;:\s@\\"]+)*)|(\\".+\\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value)) {
      return errorMsg;
    }
  },
};

// 执行器
class Validator {
  constructor(name) {
    this.caches = [];
  }
  // 添加策略的原型方法
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
        // return strategies[strategy] = (...strategyArr)
        return strategies[strategy].apply(this, strategyArr);
      });
    });
  }
  // 校验开始校验的方法
  start() {
    for (let validatorFun of this.caches) {
      let errText = validatorFun();
      if (errText) {
        return errText;
      }
    }
  }
}

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
 * 辅助el-form校验方法
 * @param {Array} stratArr 校验规则数组 ['isNoEmpty::必填项']
 * @returns
 */
function getElementFormValidator(stratArr) {
  let rules = stratArr.map(item => {
    let temp = item.split('::');
    return {
      strategy: temp[0],
      errMsg: temp[1],
    };
  });
  return function(formR, formItemV, callback) {
    let errText = checkParamsByRules([
      {
        rules: rules,
        value: formItemV,
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

export { Validator, checkParamsByRules, getElementFormValidator };
