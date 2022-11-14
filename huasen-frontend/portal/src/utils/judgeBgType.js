/*
 * @Autor: huasenjio
 * @Date: 2022-03-03 23:59:46
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-31 22:43:35
 * @Description: 用于判定是否图片链接或者是色值，用于设置css背景
 */

export function judgeBgType(value) {
  let tag = undefined;
  if (typeof value === 'string') {
    if (/^(((https?:\/\/)|(www\.))|((([0-9]{1,3}\.){3}[0-9]{1,3})|localhost)).+(gif|png|jpe?g)$/.test(value) || /img\//.test(value)) {
      tag = 'img';
    } else if (/^#[0-9a-fA-F]+$/.test(value)) {
      tag = 'color';
    } else if (/^data:image/.test(value)) {
      tag = 'base64';
    }
  } else {
    tag = 'module';
  }
  return tag;
}
