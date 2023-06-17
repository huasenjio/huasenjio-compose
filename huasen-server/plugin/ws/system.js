/*
 * @Autor: huasenjio
 * @Date: 2022-08-21 21:37:43
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-06-11 00:28:03
 * @Description: 系统信息
 */
const os = require('os');
const moment = require('moment');
const { bytesToSize } = require('../../utils/tool.js');

// 获取系统数据
function getSystemInformation() {
  try {
    let free = os.freemem();
    let total = os.totalmem();
    let used = total - free;

    let freeMemory = bytesToSize(free);
    let totalMemory = bytesToSize(total);
    let usedMemory = bytesToSize(used);

    let cpu = Number((global.huasenStatus.currentCPU * 100).toFixed(2));
    let memory = Number(((used / total) * 100).toFixed(2));
    let cpuUsage = (global.huasenStatus.currentCPU * 100).toFixed(2) + '%'; // cpu占有率
    let memoryUsage = ((used / total) * 100).toFixed(2) + '%'; // 内存占有率
    return {
      time: moment().format('HH:mm:ss'),

      freeMemory,
      usedMemory,
      totalMemory,

      cpu,
      memory,
      cpuUsage,
      memoryUsage,
    };
  } catch (err) {
    return {};
  }
}

module.exports = {
  getSystemInformation,
  bytesToSize,
};
