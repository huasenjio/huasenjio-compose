
/**
 * CDN动态引入第三方库
 * @param {String} cdnUrl cdn链接地址
 * @param {String} type   引入的资源类型
 */
export function getCDN(cdnUrl, type, callback) {
  return new Promise((resolve, reject) => {
    let script = document.createElement('script')
    script.type = type
    script.src = cdnUrl
    script.onload = function () {
      if (callback) callback()
      resolve('CDN成功')
    }
    script.onerror = function () {
      reject('CDN失败')
    }
    document.head.appendChild(script) // 加入head标签中
  })
}