/*
 * @Autor: huasenjio
 * @Date: 2022-09-04 14:28:39
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-09-04 15:07:15
 * @Description: tailwindcss 辅助方法
 */

/**
 * 注入精细化变量：
 * top-px-98
 * -top-px-98
 * p-px-50
 * -p-px-50
 * m-px-50
 * -m-px-50
 * w-px-50
 * -w-px-50
 * h-px-50
 * -h-px-50
 * @returns Object
 */

/**
 * // 构建px的尺寸
 * @param {Number} range 生成范围
 * @param {String} tag   正数 ｜ 负数
 * @returns
 */
function createPX(range = 400, tag) {
  let fullPxs = {};
  new Array(range).fill(undefined).forEach((item, index) => {
    if (index % 2 === 0 || index % 5 === 0) {
      if (tag === 'negative') {
        // 负数
        fullPxs[`-px-${index}`] = `-${index}px`;
      } else {
        // 正数
        fullPxs[`px-${index}`] = `${index}px`;
      }
    }
  });
  return fullPxs;
}

module.exports = { createPX };
