export function getCDN(cdnUrl, type, callback) {
  return new Promise((resolve, reject) => {
    let script = document.createElement('script');
    script.type = type;
    script.src = cdnUrl;
    script.onload = function () {
      if (callback) callback();
      resolve('CDN成功');
    };
    script.onerror = function () {
      reject('CDN失败');
    };
    document.head.appendChild(script);
  });
}

export function getElementPath(element) {
  if (element.id !== '') return 'id("' + element.id + '")';
  if (element === document.body) return element.tagName;

  let ix = 0;
  let siblings = element.parentNode.childNodes;
  for (let i = 0; i < siblings.length; i++) {
    let sibling = siblings[i];
    if (sibling === element) return getElementPath(element.parentNode) + '/' + element.tagName + '[' + (ix + 1) + ']';
    if (sibling.nodeType === 1 && sibling.tagName === element.tagName) ix++;
  }
}

export function openPage(url, target = '_blank') {
  window.open(url, target);
}
