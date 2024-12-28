/*
 * @Autor: huasenjio
 * @Date: 2022-10-22 15:29:02
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-22 15:43:31
 * @Description: 服务控制器
 */
const systemSetting = require('../setting.json');

async function getCopyright(req, res, next) {
  try {
    const copyright = systemSetting.copyright || {};
    global.huasen.responseData(res, copyright, 'SUCCESS', '获取版权信息');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCopyright,
};
