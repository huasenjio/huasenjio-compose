/**
 * 拷贝到剪切板
 * @param {String}} content 拷贝的内容
 * @param {String}  message 拷贝成功提示文字
 */
export function copyTextToClip(content, message) {
  var huasen = document.createElement('input');
  huasen.setAttribute('value', content);
  document.body.appendChild(huasen);
  huasen.select();
  document.execCommand('copy');
  document.body.removeChild(huasen);
  if (message == null) {
    alert('复制成功');
  } else {
    alert(message);
  }
}
