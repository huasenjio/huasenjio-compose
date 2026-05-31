class BrowserStorage {
  constructor(options = {}) {
    this.silentClear = options.silentClear === true;
  }

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
    }
    localStorage.removeItem(key);
  }

  removeItemByKey(key) {
    if (key === undefined || key === null || key === '' || key === 0) return;
    localStorage.removeItem(key);
  }

  clear(tips = '您确定清除本地所有存储吗？', payload = {}) {
    const { onConfirm, onCancel } = payload;
    if (tips === '' && this.silentClear) {
      localStorage.clear();
      if (typeof onConfirm === 'function') {
        onConfirm();
      }
      return;
    }

    const flag = confirm(tips);
    if (flag) {
      localStorage.clear();
      if (typeof onConfirm === 'function') {
        onConfirm();
      }
    } else if (typeof onCancel === 'function') {
      onCancel();
    }
  }
}

export function createStorage(options) {
  return new BrowserStorage(options);
}

export { BrowserStorage };
