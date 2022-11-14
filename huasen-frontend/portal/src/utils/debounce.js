/**
 * 防抖函数
 * 特定事件段内触发的函数不会被执行
 * @param {Function}  function 执行的函数
 * @param {Number}    delay    防抖时间
 */
export function debounce(func, delay) {
  let timeing = null; // 定义一个定时器变量
  return function (...args) {
    // 存在则清除定时器
    if (timeing) {
      clearTimeout(timeing);
    }
    // 不存在则重新定时
    timeing = setTimeout(() => {
      return func.apply(this, arguments); // 传入参数
    }, delay);
  };
}