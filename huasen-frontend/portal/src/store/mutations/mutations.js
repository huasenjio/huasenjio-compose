/*
 * @Autor: huasenjio
 * @Date: 2021-08-25 01:53:35
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-25 00:05:07
 * @Description:
 */

export default {
  /**
   * 
   * 深层合并更新state，若仓库值和载荷值类型不同，则直接覆盖更新。载荷值为undefined会被忽略，不更新仓库值。
   * @param {Object} state - 仓库对象
   * @param {Object} payload - 载荷对象
   */
  commitAll(state, payload) {
    const merge = function merge(s, p) {
      const pKeys = Object.keys(p);
      if (Object.prototype.toString.call(p) === '[object Object]' && pKeys.length > 0 && s !== p) {
        pKeys.forEach(key => {
          const sValue = s[key];
          const pValue = p[key];
          const sType = Object.prototype.toString.call(sValue);
          const pType = Object.prototype.toString.call(pValue);
          // 忽略更新值为undefined的情况
          if (pValue === undefined) return;
          if (sType === pType) {
            if (pType === '[object Object]') {
              merge(sValue, pValue);
            } else {
              s[key] = pValue;
            }
          } else {
            s[key] = pValue;
          }
        });
      }
    };
    merge(state, payload);
  },
};
