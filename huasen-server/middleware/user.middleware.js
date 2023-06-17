/*
 * @Autor: huasenjio
 * @Date: 2022-10-22 11:41:42
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-12 11:04:40
 * @Description: 用户中间件
 */

function checkUserAccountUnique(req, res, next) {
  let { id } = req.huasenParams;
  req.epWorking(
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
  );
}

module.exports = {
  checkUserAccountUnique,
};
