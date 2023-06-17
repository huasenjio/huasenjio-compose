/*
 * @Autor: huasenjio
 * @Date: 2022-09-28 01:33:06
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-29 00:30:02
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
