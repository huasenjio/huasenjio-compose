/*
 * @Autor: huasenjio
 * @Date: 2022-08-27 01:20:54
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-08-27 15:02:07
 * @Description: 处理错误日志
 */

/**
 * 格式化输出错误
 * @param {String} module 模块或功能
 * @param {String} part   部分 
 * @param {String} msg    消息 
 */
function formatError(err, msg = '未知错误') {
  if (!err) return
  console.error(`[${msg}]`, err)
}

module.exports = {
  formatError
}