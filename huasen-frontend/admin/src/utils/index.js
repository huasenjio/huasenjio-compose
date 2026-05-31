/*
 * @Autor: huasenjio
 * @Date: 2021-11-15 22:14:23
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-12-11 11:00:44
 * @Description:
 */
import { getServerApi, handleSize as formatAppSize } from '@huasen/shared';
import CONSTANT from '@/constant/index.js';
import { randomColor } from './randomColor';
import { overrideKeys } from './lodash-lib.js';

function handleSize(size) {
  return formatAppSize(size, CONSTANT.appMinWidth);
}

export default {
  getServerApi,
  handleSize,
  randomColor,
  overrideKeys,
};
