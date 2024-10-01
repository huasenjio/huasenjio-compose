/**
 * 请求参数拼接在url链接中
 * @param {String} url 链接字符串
 * @param {Object} data 参数对象
 * @returns 拼接后的URL字符串
 */
export function handleURL(url = '', data = {}) {
  // 创建URL对象
  const urlObj = new URL(url);
  // 如果data不为空，则添加查询参数
  if (Object.keys(data).length > 0) {
    // 使用URLSearchParams处理查询参数
    const searchParams = new URLSearchParams(urlObj.search);
    for (const [key, value] of Object.entries(data)) {
      searchParams.set(key, value);
    }
    // 更新URL对象的查询字符串
    urlObj.search = searchParams.toString();
  }
  // 返回拼接后的URL字符串
  return urlObj.toString();
}