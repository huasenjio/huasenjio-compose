/*
 * @Autor: huasenjio
 * @Date: 2022-09-30 01:24:44
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-28 01:03:13
 * @Description:
 */

import Vue from 'vue';

class EventBusTool {
  constructor() {
    this.$eventBus = new Vue();
  }
  pubEv(name) {
    let args = Array.from(arguments);
    let params = args.slice(1, args.length);
    this.$eventBus.$emit(name, ...params);
  }
  subEv(name, call) {
    this.$eventBus.$on(name, call);
  }
  subOnceEv(name, call) {
    this.$eventBus.$once(name, call);
  }
  unSubEv(name) {
    this.$eventBus.$off(name);
  }
}

export default new EventBusTool();
