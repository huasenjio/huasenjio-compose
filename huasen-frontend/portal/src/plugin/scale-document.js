/*
 * @Autor: huasenjio
 * @Date: 2022-09-03 13:59:36
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-04-22 18:31:37
 * @Description: 移动端设备，通过缩放可视窗口，实现完美展现
 */

import { debounce } from 'lodash';
import CONSTENT from '@/constant/index.js';

// 不缩放开关
let noScale = false;

// resize事件回调
let scaleDocument = debounce(e => {
  let viewport = document.getElementById('viewport');
  // 计算缩放比例
  let scale = document.body.clientWidth / CONSTENT.appMinWidth;
  if (scale === 1) {
    // 若比例等于1，就不再缩放，否则屏幕由于缩放，一直抖动
    noScale = true;
  } else if (noScale) {
    // 无需缩放
  } else if (scale < 1) {
    // 缩放
    viewport.content = `width=device-width,initial-scale=${scale}`;
    noScale = true;
  } else {
    // 复原
    viewport.content = 'width=device-width,initial-scale=1.0';
    noScale = false;
  }
}, 500);

// 初始化
function initScaleDocument() {
  window.addEventListener('resize', scaleDocument);
  let event = new Event('resize', { bubbles: true, cancelable: false });
  document.dispatchEvent(event);
}

// 销毁
function destoryScaleDocument() {
  window.removeEventListener('resize', scaleDocument);
}

export { initScaleDocument, destoryScaleDocument };
