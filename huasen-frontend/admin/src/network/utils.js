/*
 * @Autor: huasenjio
 * @Date: 2022-06-12 14:29:42
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-09-06 21:55:40
 * @Description: 网络请求模块工具类
 */

// 格式化mock返回数据，建议与后端接口返回一致
function mockResponseFormat(data) {
  if (typeof data === 'function') {
    return data;
  } else {
    return {
      code: 200, // 200正常｜500出错｜204空内容｜401认证身份｜403权限不足
      msg: '请求成功',
      data: data,
    };
  }
}

/**
 * 参数拼接到url上
 * @param {String} url  链接字符串
 * @param {Object} data 参数对象
 * @returns String 完整的链接
 */
function handleParamsToURL(url, data) {
  if (!url) return;
  if (typeof data !== 'object' || Object.keys(data).length === 0) return;
  // 若链接尾部带有"/"则替换成为空字符，拼接"?"字符
  url = url.replace(/\/$/, '') + '?';
  // 参数字符串
  let params = '';
  for (const [name, value] of Object.entries(data)) {
    params += '&' + name + '=' + encodeURIComponent(value); // 将参数转变成为url编码后通过&name=参数拼接
  }
  // 利用正则去除参数中的第一个&符号
  params = params.replace(/^&/, '');
  url = url + params;
  return url; // 返回URL
}

export { mockResponseFormat, handleParamsToURL };
