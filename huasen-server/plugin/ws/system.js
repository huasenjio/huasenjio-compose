/*
 * @Autor: huasenjio
 * @Date: 2022-08-21 21:37:43
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-20 21:11:30
 * @Description: 系统信息
 */
const os = require('os');
const moment = require('moment');

function bytesToSize(bytes) {
  if (bytes === 0) return '0 B';
  let k = 1024;
  let sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  let i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
}

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
