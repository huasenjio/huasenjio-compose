/*
 * @Autor: huasenjio
 * @Date: 2022-09-03 17:19:18
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-09-03 17:21:10
 * @Description: 全局过滤器
 */

import Vue from 'vue';

Vue.filter('emptyTip', function(value) {
  if (value === '' || value === undefined || value === null) {
    return '--';
  } else {
    return value;
  }
});
