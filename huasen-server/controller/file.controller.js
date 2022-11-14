/*
 * @Autor: huasenjio
 * @Date: 2022-10-10 00:36:28
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-19 22:24:10
 * @Description: 文件控制器
 */
const path = require('path');
const { readDirectory, unlinkFile } = require('../utils/tool.js');

const fileType = [
  'png',
  'jpg',
  'jpeg',
  'zip',
  'rar',
  'pdf',
  'md',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'ppt',
  'pptx',
  'html',
  'css',
  'js',
];

function findAll(req, res, next) {
  let files = readDirectory(path.resolve(process.cwd(), '../huasen-store'));
  files = files.map(item => {
    return item.split(/\/|\\/).slice(-3).join('/');
  });
  files = files.filter(filePath => {
    let fileName = filePath.split(/\/|\\/).slice(-1).join('');
    let ext = fileName.split('.').slice(-1).join('');
    return fileType.includes(ext);
  });
  global.huasen.responseData(res, files, 'SUCCESS', '文件查询成功', false);
}

function remove(req, res, next) {
  let { filePath } = req.huasenParams;
  let removeFilePath = path.resolve(process.cwd(), `../${filePath}`);
  unlinkFile(removeFilePath)
    .then(result => {
      global.huasen.responseData(res, {}, 'SUCCESS', '文件删除成功', false);
    })
    .catch(err => {
      global.huasen.responseData(res, err, 'ERROR', '文件删除失败', false);
    });
}
module.exports = {
  findAll,
  remove,
};
