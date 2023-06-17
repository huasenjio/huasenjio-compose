/*
 * @Autor: huasenjio
 * @Date: 2022-10-22 15:29:02
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-22 15:43:31
 * @Description: 邮箱控制器
 */

const MAILER = require('../plugin/mail.js');

async function getCode(req, res, next) {
  try {
    let { mail } = req.huasenParams;
    let mailCode = await MAILER.findCodeByMail(mail);
    if (mailCode) {
      global.huasen.responseData(res, {}, 'SUCCESS', '邮箱验证码已发送', false);
    } else {
      let code = Math.floor(Math.random() * (10000 - 1)) + 1;
      let data = await MAILER.sendCode(mail, code);
      global.huasen.responseData(res, data, 'SUCCESS', '邮箱验证码发送成功', false);
    }
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCode,
};
