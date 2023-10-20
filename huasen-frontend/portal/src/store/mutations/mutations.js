/*
 * @Autor: huasenjio
 * @Date: 2021-08-25 01:53:35
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-25 00:05:07
 * @Description:
 *
 * 覆盖规则：
 * 1.payload节点存在，state节点不存在，新增state节点，值与payload节点相同；
 * 2.payload和state节点类型不相等，payload覆盖state；
 * 3.payload节点是空对象或数组，payload覆盖state；
 * 4.state节点是array、function、symbol、null、undefined、布尔值、字符、数字类型，payload覆盖state；
 */

export default {
  // 万能mutations
  commitAll(state, payload) {
    const merge = function merge(s, p) {
      // 异常处理
      if (Object.prototype.toString.call(p) !== '[object Object]' || s === p) {
        return false;
      }

      Object.keys(p).forEach(key => {
        if (typeof s[key] === typeof p[key]) {
          // 类型相等时，若state值不为对象，则直接覆盖
          if (Object.prototype.toString.call(s[key]) === '[object Object]') {
            // 更新值为对象，并且不为空，则需要递归遍历，否则直接覆盖
            if (Object.prototype.toString.call(p[key]) === '[object Object]' && Object.keys(p[key]).length !== 0) {
              merge(s[key], p[key]);
            } else {
              s[key] = p[key];
            }
          } else {
            s[key] = p[key];
          }
        } else {
          // state值和更新值类型不相等时，直接覆盖更新
          s[key] = p[key];
        }
      });
    };
    merge(state, payload);
  },
};
