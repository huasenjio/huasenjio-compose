/*
 * @Autor: huasenjio
 * @Date: 2022-09-29 23:51:34
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-09-30 00:00:42
 * @Description: 处理传入尺寸数据，支持'100%' || '100px' = '100' = 100 = '100px'
 */

import CONSTANT from '@/constant/index.js';

export function handleSize(size) {
  if (typeof size === 'string') {
    return /^\d+(%|px)$/.test(size) ? size : `${size}px`;
  } else if (typeof size === 'number') {
    return `${size}px`;
  } else {
    return `${CONSTANT.appMinWidth}px`;
  }
}
