/*
 * @Autor: huasenjio
 * @Date: 2022-09-25 13:20:40
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-09-30 00:59:09
 * @Description:
 */
import Vue from 'vue';
import VueI18n from 'vue-i18n';

Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: 'cn',
  messages: {
    en: {
      messages: {
        name: 'huasen-cli',
        welcome: 'hello',
        status: 'ok',
        i18nTest: 'click me',
      },
    },
    cn: {
      messages: {
        name: '花森脚手架',
        welcome: '你好',
        status: '成功',
        i18nTest: '点我试试',
      },
    },
  },
});

export default i18n;
