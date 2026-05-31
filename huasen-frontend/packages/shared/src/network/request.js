import Mock from 'mockjs2';

/**
 * 创建 get/post/upload/download 请求工具
 * @param {Object} options
 * @param {Object} options.Config - 网络默认配置
 * @param {Function} options.http - axios 请求方法
 * @param {Boolean} options.useGlobalMockGate - mock 是否先受 Config.globalMock 总开关控制
 * @param {Boolean} options.enableLoadingOption - 是否注入 _loading 配置
 * @returns {Object}
 */
export function createRequestMethods({ Config, http, useGlobalMockGate = false, enableLoadingOption = false }) {
  function registerMock(url, method, mock, FSW) {
    let isMock = null;
    const hasMock = typeof mock == 'object' || typeof mock == 'function';
    const enabledByGlobal = useGlobalMockGate ? Config.globalMock : true;

    if (enabledByGlobal && hasMock) {
      FSW = FSW === undefined ? Config.globalMock : FSW;
      if (FSW) {
        const regExpText = url.replace(/\//g, '\\/');
        Mock.mock(new RegExp(regExpText), method, mock);
        isMock = true;
      }
    }

    return isMock;
  }

  function applyCommonOption(option, isMock) {
    if (option._cancelable) option.cancelToken = Config.cancelToken;
    if (isMock) option._isMock = isMock;
    if (enableLoadingOption) option._loading = Object.prototype.hasOwnProperty.call(option, 'loading') ? option.loading : Config.globalLoading;
    option._notify = Object.prototype.hasOwnProperty.call(option, 'notify') ? option.notify : Config.globalNotify;
    option._errorNotify = Object.prototype.hasOwnProperty.call(option, 'errorNotify') ? option.errorNotify : Config.globalErrorNotify;
  }

  function get(url, mock, FSW) {
    const isMock = registerMock(url, 'get', mock, FSW);

    return function requestGet(params, option = {}) {
      applyCommonOption(option, isMock);
      return http({
        url,
        params,
        ...option,
        method: 'get',
      });
    };
  }

  function post(url, mock, FSW = true) {
    const isMock = registerMock(url, 'post', mock, FSW);

    return function requestPost(data, option = {}) {
      applyCommonOption(option, isMock);
      option._secret = Object.prototype.hasOwnProperty.call(option, 'secret') ? option.secret : Config.globalSecret;
      return http({
        url,
        data,
        ...option,
        method: 'post',
      });
    };
  }

  function upload(url) {
    return function requestUpload(data, option = {}) {
      return http({
        url,
        data,
        ...option,
        method: 'post',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    };
  }

  function downloadFileByUrl(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', filename);
    a.setAttribute('target', '_blank');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function downloadFileByBlob(url, data, fileName, MIME, callback) {
    return http({
      url,
      data,
      method: 'post',
      responseType: 'blob',
      timeout: 360000,
    })
      .then(result => {
        if (callback) callback(result);
        const a = document.createElement('a');
        const blob = new Blob([result], { type: MIME });
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.style.display = 'none';
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(a.href);
      })
      .catch(() => {
        alert('下载流文件失败');
      });
  }

  return {
    get,
    post,
    upload,
    downloadFileByUrl,
    downloadFileByBlob,
  };
}
