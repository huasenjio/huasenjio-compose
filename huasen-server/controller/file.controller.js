/*
 * @Autor: huasenjio
 * @Date: 2022-10-10 00:36:28
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-05-24 22:51:57
 * @Description: 文件控制器
 */
const path = require('path');
const compressing = require('compressing');
const { readDirectory, unlinkFile, getTime } = require('../utils/tool.js');
const { MixtureUpload } = require('../plugin/mixture-upload/index.js');
const { STORE } = require('../config.js');
const fileType = Object.keys(STORE.acceptTypes);
const uploadConfigMap = {
  icon: {
    uploadPath: path.resolve(process.cwd(), '../huasen-store/icon'),
  },
  banner: {
    uploadPath: path.resolve(process.cwd(), '../huasen-store/banner'),
  },
  article: {
    uploadPath: path.resolve(process.cwd(), '../huasen-store/article'),
  },
  img: {
    uploadPath: path.resolve(process.cwd(), '../huasen-store/img'),
  },
  default: {
    uploadPath: path.resolve(process.cwd(), '../huasen-store/default'),
  },
};

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

// 压缩
async function conpresStoreFile(req, res, next) {
  let filePath = path.resolve(process.cwd(), '../huasen-store');
  let outputPath = path.resolve(process.cwd(), `../huasen-store/temp/store-${new Date().getTime()}.zip`);
  compressing.zip.compressDir(filePath, outputPath).then(async result => {
    global.huasen.responseData(res, { filePath: outputPath }, 'SUCCESS', '已压缩');
    await unlinkFile(outputPath);
  });
}

// 解压
async function unconpressStoreFile(req, res, next) {
  let filePath = path.resolve(process.cwd(), '../huasen-store/temp/store-1632440000000.zip');
  let outputPath = path.resolve(process.cwd(), '../huasen-store');
  let zipFilePath = path.resolve(process.cwd(), filePath);
  compressing.zip.uncompress(zipFilePath, outputPath);
}

function uploadFileToStore(req, res, next) {
  let { type = 'default' } = req.huasenParams;
  let option = uploadConfigMap[type]
  const mixtureUpload = new MixtureUpload({
    ...option,
    // 文件过滤钩子，默认不过滤，返回true则上传，返回false则拒绝
    // handleFilter: file => {
    //   return true;
    // },
    // 文件重命名钩子
    handleFileName: file => {
      let names = file.originalFilename.split('.');
      // 弹出后缀名
      names.pop();
      // 把空格替换成下划线
      return `${names.join('').replaceAll(' ', '_')}-${getTime(true)}`;
    },
    // 上传成功钩子
    onSuccess: (data, files) => {
      let resultFiles = [];
      Object.values(files).forEach(item => {
        if (Array.isArray(item)) {
          resultFiles = resultFiles.concat(item);
        } else {
          resultFiles.push(item);
        }
      });
      for (let i = 0; i < resultFiles.length; i++) {
        resultFiles[i].path = resultFiles[i].path.split(/\/|\\/).slice(-3).join('/');
      }
      global.huasen.responseData(res, resultFiles, 'SUCCESS', '已上传');
    },
    // 上传失败钩子
    onError: err => {
      global.huasen.responseData(res, {}, 'ERROR', err.msg);
    },
  });
  mixtureUpload.uploader(req, res, next);
}

module.exports = {
  findAll,
  findAllIcon,
  remove,
  uploadFileToStore
};
