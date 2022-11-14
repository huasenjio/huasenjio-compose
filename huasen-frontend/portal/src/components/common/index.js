/*
 * @Autor: huasenjio
 * @Date: 2021-08-25 01:53:35
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-09-27 01:06:39
 * @Description: 统一注册组件
 */
import Vue from 'vue';
// 引入组件
import Toast from './toast/Toast';
import Markdown from './markdown/Markdown.vue';

// 组件注册全局引入组件
Vue.component('HMarkdown', Markdown);

// 创建插件方式安装对象
const huasen = {};
huasen.install = function(Vue) {
  // 1.创建toast构造器
  const toastContrustor = Vue.extend(Toast);
  // 2.生成构造器实例
  const hToast = new toastContrustor();
  // 3.为构造器绑定元素
  hToast.$mount(document.createElement('div'));
  // 4.添加到文档流中
  document.body.appendChild(hToast.$el);
  // 5.vue原型绑定对象
  Vue.prototype.$hToast = hToast;
};

Vue.use(huasen);
