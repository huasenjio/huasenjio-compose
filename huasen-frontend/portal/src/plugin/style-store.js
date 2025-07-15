/*
 * @Autor: huasenjio
 * @Date: 2022-09-10 23:16:16
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-09-30 01:01:28
 * @Description: 根据查询存储的样式数据
 */
import _ from 'lodash';
import state from '@/store/state/state.js';

export function getStyleById(id) {
  try {
    const theme = _.get(state, 'user.config.theme', {});
    return theme[id] || {};
  } catch (err) {
    return {};
  }
}

export function setStyleById(id, style) {
  try {
    const theme = _.get(state, 'user.config.theme', {});
    theme[id] = style;
  } catch (err) {
    console.warn('setStyleById', err);
  }
}

export function removeStyleById(id) {
  try {
    const theme = _.get(state, 'user.config.theme', {});
    delete theme[id];
  } catch (err) {
    console.warn('removeStyleById', err);
  }
}
