/*
 * @Autor: huasenjio
 * @Date: 2021-08-25 01:53:35
 * @LastEditors: huasenjio
 * @LastEditTime: 2026-05-04 00:00:00
 * @Description: 管理端公共组件统一注册入口
 */

import { HBrowserTips, HDialog, HEmpty, HIcon, HToast } from '@huasen/ui';
import HsDrawer from './drawer/Drawer.vue';
import HsFileUpLoad from './file-upload/FileUpload.vue';
import ImgUpload from './img-upload/ImgUpload.vue';

const components = {
  HBrowserTips,
  HDialog,
  HEmpty,
  HIcon,
  HsDrawer,
  HsFileUpLoad,
  FileUpLoad: HsFileUpLoad,
  ImgUpload,
};

const huasen = {};

huasen.install = function (Vue) {
  Object.keys(components).forEach(function (name) {
    Vue.component(name, components[name]);
  });
  Vue.component('HIcon', HIcon);

  const toastContrustor = Vue.extend(HToast);
  const hToast = new toastContrustor();
  hToast.$mount(document.createElement('div'));
  document.body.appendChild(hToast.$el);
  Vue.prototype.$hToast = hToast;
};

export default huasen;
