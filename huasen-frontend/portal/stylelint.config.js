/*
 * @Autor: huasenjio
 * @Date: 2022-04-02 23:50:37
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-04-02 23:52:54
 * @Description: node-sass转dart-sass修补
 */

module.exports = {
  rules: {
    'selector-pseudo-element-no-unknown': [
      true,
      {
        ignorePseudoElements: ['v-deep'],
      },
    ],
  },
};
