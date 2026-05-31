/**
 * 异步错误扁平化处理方法
 * @param {function | Promise} task - 函数或Promise
 * @example const [err, null] = await flatAsync(fn)
 */

async function flatAsync(task) {
  let promise;
  try {
    // 处理函数调用
    if (Object.prototype.toString.call(task) === "[object Promise]") {
      promise = task;
    } else if (
      Object.prototype.toString.call(task) === "[object AsyncFunction]"
    ) {
      promise = task();
    } else if (typeof task === "function") {
      promise = Promise.resolve(task());
    } else {
      throw new Error("flatAsync 参数必须为函数或 Promise 对象");
    }
    const res = await promise;
    return [null, res];
  } catch (err) {
    return [err, null];
  }
}

export { flatAsync };
