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

/**
 * 覆盖对象属性
 * @param {Object} data - 目标对象
 * @param {Object} srcData - 源对象
 * @param {Boolean} ignoreUndefined - 是否忽略undefined值
 * @param {Boolean} append - 是否追加
 */
export function overrideKeys(data, srcData, ignoreUndefined = false, append = true) {
  let paths = getPath(data);
  let srcPaths = getPath(srcData);
  const removePaths = _.difference(paths, srcPaths);
  const addPaths = _.difference(srcPaths, paths);
  const commonPaths = _.intersection(paths, srcPaths);
  // 忽略undefined，表示不删除属性
  if (!ignoreUndefined) {
    removePaths.forEach(path => {
      _.unset(data, path);
    });
  }
  // 追加属性
  if (append) {
    addPaths.forEach(path => {
      _.set(data, path, _.get(srcData, path));
    })
  }
  // 修改公共属性
  commonPaths.forEach(path => {
    _.set(data, path, _.get(srcData, path));
  })
}
