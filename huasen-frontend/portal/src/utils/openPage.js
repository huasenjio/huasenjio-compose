/*
 * @Autor: huasenjio
 * @Date: 2022-04-16 15:24:22
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-04-16 15:26:51
 * @Description: 打开新标签页
 */

export function openPage(url, target = '_blank') {
  window.open(url, target);
}