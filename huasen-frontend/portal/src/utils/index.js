/*
 * @Autor: huasenjio
 * @Date: 2021-11-15 22:14:23
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-11-05 10:22:17
 * @Description:
 */
import { getCDN, openPage, getElementPath, handleSize as formatAppSize } from '@huasen/shared';
import CONSTANT from '@/constant/index.js';
import { jumpToRead } from './jumpToRead.js';
import { randomInt } from './randomInt.js';
import { judgeBgType } from './judgeBgType';

function handleSize(size) {
  return formatAppSize(size, CONSTANT.appMinWidth);
}

export default {
  getCDN,
  jumpToRead,
  openPage,
  randomInt,
  judgeBgType,
  handleSize,
  getElementPath,
};
