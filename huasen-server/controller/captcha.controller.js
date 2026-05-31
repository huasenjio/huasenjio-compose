/*
 * @Autor: huasenjio
 * @Date: 2026-04-01 00:00:00
 * @LastEditors: huasenjio
 * @LastEditTime: 2026-04-01 00:00:00
 * @Description: 验证码控制器
 */
const CAPTCHA = require('../plugin/captcha.js');

function getCaptcha(req, res, next) {
  CAPTCHA.create()
    .then(({ token, svg }) => {
      global.huasen.responseData(res, { token, svg }, 'SUCCESS', '获取验证码成功');
    })
    .catch(err => {
      next(err);
    });
}

module.exports = { getCaptcha };
