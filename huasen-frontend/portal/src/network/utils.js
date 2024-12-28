/*
 * @Autor: huasenjio
 * @Date: 2022-06-12 14:29:42
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-20 23:46:04
 * @Description: 网络请求模块工具类
 */

/**
 * 参数拼接到url上
 * @param {String} url  链接字符串
 * @param {Object} data 参数对象
 * @returns String 完整的链接
 */
function handleParamsToURL(url, data) {
  // 检查url是否有效以及data是否为非空对象
  if (!url || typeof data !== 'object' || Object.keys(data).length === 0) return url;
  // 若链接尾部带有"/"则替换成为空字符，拼接"?"字符
  url = url.replace(/\/+$/, '') + '?';
  // 参数字符串
  const params = Object.entries(data)
    .map(([name, value]) => `${name}=${encodeURIComponent(value)}`)
    .join('&');

  // 返回拼接后的URL
  return `${url}${params}`;
}

export { handleParamsToURL };
