/*
 * @Autor: huasenjio
 * @Date: 2022-10-10 00:36:28
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-05-24 22:51:57
 * @Description: 文件控制器
 */
const path = require('path');
const compressing = require('compressing');
const { STORE } = require('../config.js');
const { readDirectory, unlinkFile } = require('../utils/tool.js');

const fileType = Object.keys(STORE.acceptTypes);

function findAll(req, res, next) {
  let files = readDirectory(path.resolve(process.cwd(), '../huasen-store'));
  files = files.filter(path => !path.includes('/huasen-store/webapp'))
  files = files.map(item => {
    return item.slice(item.indexOf('huasen-store'));
  });
  files = files.filter(filePath => {
    let fileName = filePath.split(/\/|\\/).slice(-1).join('');
    let ext = fileName.split('.').slice(-1).join('');
    return fileType.includes('.' + ext.toLowerCase());
  });
  global.huasen.responseData(res, files, 'SUCCESS', '查询文件');
}

function findAllIcon(req, res, next) {
  const iconPath = path.resolve(process.cwd(), '../huasen-store/icon')
  let files = readDirectory(iconPath);
  files = files.map(item => {
    return item.split(/\/|\\/).slice(-3).join('/');
  });
  files = files.filter(filePath => {
    let fileName = filePath.split(/\/|\\/).slice(-1).join('');
    let ext = fileName.split('.').slice(-1).join('');
    return fileType.includes('.' + ext.toLowerCase());
  });
  global.huasen.responseData(res, files, 'SUCCESS', '查询图标库');
}

async function remove(req, res, next) {
  let { filePath, filePaths, isMultiple } = req.huasenParams;
  if (isMultiple) {
    // 循环删除文件
    for (let i = 0; i < filePaths.length; i++) {
      let removeFilePath = path.resolve(process.cwd(), `../${filePaths[i]}`);
      await unlinkFile(removeFilePath);
    }
  } else {
    // 删除单个文件
    let removeFilePath = path.resolve(process.cwd(), `../${filePath}`);
    await unlinkFile(removeFilePath);
  }

  global.huasen.responseData(res, {}, 'SUCCESS', '删除文件');
}

// 压缩后下载
async function downloadStoreByZip(req, res, next) {
  let filePath = path.resolve(process.cwd(), '../huasen-store');
  let outputPath = path.resolve(process.cwd(), `../huasen-store/zip/file${new Date().getTime()}.zip`);
  compressing.zip.compressDir(filePath, outputPath).then(async result => {
    global.huasen.responseData(res, { filePath: outputPath }, 'SUCCESS', '查询文件句柄');
    await unlinkFile(outputPath);
  });
}

// 解压
async function unconpressFile(req, res, next) {
  let outputPath = path.resolve(process.cwd(), '../huasen-store');
  let zipFilePath = path.resolve(process.cwd(), '文件地址');
  compressing.zip.uncompress(zipFilePath, outputPath);
}

module.exports = {
  findAll,
  remove,
  findAllIcon,
  downloadStoreByZip,
};
