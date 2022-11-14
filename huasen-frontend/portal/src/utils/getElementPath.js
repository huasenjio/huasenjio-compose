/*
 * @Autor: huasenjio
 * @Date: 2022-10-21 23:15:04
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-22 00:11:53
 * @Description: 获取dom的xpath
 */

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
