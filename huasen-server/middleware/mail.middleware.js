/*
 * @Autor: huasenjio
 * @Date: 2022-10-22 16:34:52
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-22 16:46:59
 * @Description: 邮箱中间件
 */

const MAILER = require('../plugin/mail.js');

function checkMailCode(req, res, next) {
  let { id, mailCode } = req.huasenParams;
  MAILER.findCodeByMail(id)
    .then(code => {
      // 邮箱验证码校验
      if (code == mailCode) {
        next();
      } else {
        global.huasen.responseData(res, {}, 'ERROR', '邮箱验证码不正确', false);
      }
    })
    .catch(err => {
      next(err);
    });
}

module.exports = {
  checkMailCode,
};
