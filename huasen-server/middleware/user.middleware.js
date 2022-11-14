/*
 * @Autor: huasenjio
 * @Date: 2022-10-22 11:41:42
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-11-05 15:12:21
 * @Description: 用户中间件
 */

function checkUserAccountUnique(req, res, next) {
  let { id } = req.huasenParams;
  global.huasen.working(
    [
      {
        schemaName: 'User',
        methodName: 'find',
        payloads: [
          {
            id,
          },
        ],
      },
    ],
    users => {
      if (users.length === 0) {
        next();
      } else {
        global.huasen.responseData(res, {}, 'ERROR', '用户已存在', false);
      }
    },
    req,
  );
}

module.exports = {
  checkUserAccountUnique,
};
