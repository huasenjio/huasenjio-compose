/**
 * 将传入input加载的file对象或blob对象转换成base64字符串
 * @param {Object}    img      blob二进制对象 或 file对象
 * @param {Function}  callback 参数为base64字符串参数的回调函数
 */
export function getBase64(file, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => {
    callback(reader.result) // 监听读取返回的值
  })
  reader.readAsDataURL(file)
}