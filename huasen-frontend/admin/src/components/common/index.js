/*
 * @Autor: huasenjio
 * @Date: 2021-08-25 01:53:35
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-01-27 21:33:35
 * @Description: 统一注册组件
 */
import Vue from "vue";
// 引入组件
import Shade from "./shade/Shade";
import Toast from "./toast/Toast";
import Popup from "./popup/Popup"
import Swiper from "./swiper/Swiper";
import Area from "./markdown-area/MarkdownArea"
import Switch from "./switch/Switch"


// 组件注册全局引入组件
Vue.component("HPopup", Popup);
Vue.component("HSwiper", Swiper);
Vue.component("HArea", Area);
Vue.component("HSwitch", Switch);


// 创建插件方式安装对象
const huasen = {};
huasen.install = function (Vue) {
  // 1.创建toast构造器
  const toastContrustor = Vue.extend(Toast);
  const shadeContrustor = Vue.extend(Shade);
  // 2.生成构造器实例
  const hToast = new toastContrustor();
  const hShade = new shadeContrustor();
  // 3.为构造器绑定元素
  hToast.$mount(document.createElement("div"));
  hShade.$mount(document.createElement("div"));
  // 4.添加到文档流中
  document.body.appendChild(hToast.$el);
  document.body.appendChild(hShade.$el);
  // 5.vue原型绑定对象
  Vue.prototype.$hToast = hToast;
  Vue.prototype.$hShade = hShade;
};
export default huasen;
