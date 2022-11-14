/*
 * @Autor: huasenjio
 * @Date: 2022-09-28 01:33:06
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-11-05 19:43:11
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
  clear() {
    let flag = confirm('您确定清除本地所有存储吗？');
    if (flag) {
      localStorage.clear();
    }
  }
  silentClear() {
    localStorage.clear();
  }
}

export default new Storage();
