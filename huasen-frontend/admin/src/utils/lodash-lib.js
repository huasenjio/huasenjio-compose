const _ = require('lodash');

function handleLoadashPath(keys) {
  let atrr = '';
  keys.forEach(el => {
    if (typeof el === 'number') {
      atrr += `[${el}]`;
    } else {
      atrr += atrr === '' ? el : `.${el}`;
    }
  });
  return atrr;
}

export function getPath(data, path = []) {
  let lodashPaths = [];
  _.forEach(data, (value, key) => {
    // 处理输出 lodash 层级
    let atrr = handleLoadashPath([...path, key]);
    lodashPaths.push(atrr);
    if (Object.prototype.toString.call(value) === '[object Object]' || Object.prototype.toString.call(value) === '[object Array]') {
      // 递归遍历
      lodashPaths = lodashPaths.concat(getPath(value, [...path, key]));
    }
  });
  return lodashPaths;
}

// 只合并已拥有的属性
export function mergeByOwnKey(data, srcData) {
  let paths = getPath(data);
  paths.forEach(path => {
    let value = _.get(srcData, path);
    if (value !== undefined) {
      _.set(data, path, value);
    }
  });
}
