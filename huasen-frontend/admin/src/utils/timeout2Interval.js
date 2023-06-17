/*
 * @Autor: huasenjio
 * @Date: 2022-10-17 23:48:19
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-17 23:49:58
 * @Description: setTimeout实现定时效果
 */

export function timeout2Interval(fn, delay, immediate) {
  // 是否立即执行
  if (immediate) fn();
  // 延时器对象
  let timer = null;
  // 定时器回调函数
  function inside() {
    clearTimeout(timer);
    fn();
    timer = setTimeout(inside, delay);
  }
  timer = setTimeout(inside, delay);
  return {
    clear() {
      clearTimeout(timer);
    },
  };
}
