/*
 * @Autor: huasenjio
 * @Date: 2022-07-31 21:51:50
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-09-21 22:59:33
 * @Description: 防抖类
 * @example:
 * let af = new AF(this, 200);
 * af.run(function(p) {
 *   console.log('参数：', p);
 * }, param)
 */

export class AF {
  /**
   * 防抖类
   * @param {Object} scope - 作用域
   * @param {Number} delay - 延迟时间
   */
  constructor(scope, delay = 10) {
    this.delay = delay;
    this.timer = null;
    this.previous = 0;
    this.now = 0;
    this.scope = scope;
  }

  /**
   * 执行函数
   * @param {Function} func - 函数
   * @param {Object} param - 参数
   */
  run(func, param) {
    const me = this.scope;
    this.now = new Date().getTime();
    if (this.now - this.previous < this.delay) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(
      function () {
        func.call(me, param);
        this.timer = null;
      }.bind(this),
      this.delay
    );
    this.previous = this.now;
  }
}
