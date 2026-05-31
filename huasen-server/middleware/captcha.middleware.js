/*
 * @Autor: huasenjio
 * @Date: 2026-04-01 00:00:00
 * @LastEditors: huasenjio
 * @LastEditTime: 2026-04-01 00:00:00
 * @Description: 图片验证码中间件
 */
const CAPTCHA = require('../plugin/captcha.js');

function checkCaptcha(req, res, next) {
  let { captchaToken, captchaCode } = req.huasenParams;
  if (!captchaToken || !captchaCode) {
    global.huasen.responseData(res, {}, 'ERROR', '请输入图片验证码');
    return;
  }
  CAPTCHA.verify(captchaToken, captchaCode)
    .then(valid => {
      if (valid) {
        // 验证通过后立即销毁，防止重放攻击
        CAPTCHA.remove(captchaToken);
        next();
      } else {
        global.huasen.responseData(res, {}, 'ERROR', '图片验证码不正确');
      }
    })
    .catch(err => {
      next(err);
    });
}

module.exports = { checkCaptcha };
