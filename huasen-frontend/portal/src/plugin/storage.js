/*
 * @Autor: huasenjio
 * @Date: 2021-11-27 13:23:33
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-09-17 18:24:29
 * @Description:
 */
class Storage {
  constructor() {}
  setItem(key, value, expireTime) {
    localStorage.setItem(
      key,
      JSON.stringify({
        value: value,
        expired: expireTime === undefined ? undefined : Date.now() + 1000 + expireTime,
      }),
    );
  }
  getItem(key) {
    if (!localStorage.getItem(key)) {
      return;
    }
    const item = JSON.parse(localStorage.getItem(key));
    if (item.expired === undefined || Date.now() < item.expired) {
      return item.value;
    } else {
      localStorage.removeItem(key);
    }
  }
  removeItemByKey(key) {
    if (key === undefined || key === null || key === '' || key === 0) return;
    localStorage.removeItem(key);
  }
  clear() {
    let flag = confirm('您确定清除本地所有存储吗？（恢复初始模式）');
    if (flag) {
      localStorage.clear();
    }
  }
}

export default new Storage();
