/*
 * @Autor: huasenjio
 * @Date: 2022-12-11 10:58:53
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-12-11 10:59:26
 * @Description: 获得随机颜色
 */

export function randomColor() {
  return 'rgb(' + [Math.round(Math.random() * 160), Math.round(Math.random() * 160), Math.round(Math.random() * 160)].join(',') + ')';
}
