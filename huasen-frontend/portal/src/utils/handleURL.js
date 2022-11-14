/**
 * 请求参数拼接在url链接中
 * @param {String} url  链接字符串
 * @param {Object} data 参数对象
 * @returns 拼接后字符串
 */
export function handleURL(url = '', data = {}) {
  // 判断传输data数据是否是空对象，通过Object.keys获取对象属性数值，判断如果等于零就不执行
  if (Object.keys(data).length !== 0) {
    url = url.replace(/\/$/, '') + '?' // 如果链接尾部带有"/"则替换成为空字符，拼接"?"字符
    let params = ''
    for (const [name, value] of Object.entries(data)) {
      params += '&' + name + '=' + encodeURIComponent(value) // 将参数转变成为url编码后通过&name=参数拼接
    }
    params = params.replace(/^&/, '') // 利用正则去除参数中的第一个&符号
    url = url + params
  }
  return url // 返回URL
}