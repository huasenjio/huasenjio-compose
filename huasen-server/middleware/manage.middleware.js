/*
 * @Autor: huasenjio
 * @Date: 2022-10-05 00:22:37
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-11-05 15:14:40
 * @Description: 管理员中间件
 */
const path = require('path');

const { MixtureUpload } = require('../plugin/mixture-upload/index.js');

// 上传中间件
function upload(req, res, next) {
  let isIcon = req.path === '/uploadIcon' ? true : false;
  let options = {};
  if (isIcon) options.acceptTypes = ['image/jpg', 'image/jpeg', 'image/png'];
  if (isIcon) options.uploadPath = path.resolve(process.cwd(), '../huasen-store/icon');

  const mixtureUpload = new MixtureUpload({
    ...options,
    handleFilter: file => {
      return true;
    },
    handleFileName: file => {
      return `${Date.now()}`;
    },
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
      global.huasen.responseData(res, resultFiles, 'SUCCESS', '上传成功', false);
    },
    onError: err => {
      global.huasen.responseData(res, {}, 'ERROR', err.msg);
    },
  });
  mixtureUpload.uploader(req, res, next);
}

// 上传图标
function uploadIcon(req, res, next) {
  const mixtureUpload = new MixtureUpload({
    acceptTypes: ['image/jpg', 'image/jpeg', 'image/png'],
    uploadPath: path.resolve(__dirname, '../huasen-store/default'), // 默认上传文件路径
    handleFilter: file => {
      return true;
    },
    handleFileName: file => {
      return `${Date.now()}`;
    },
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
      global.huasen.responseData(res, resultFiles, 'SUCCESS', '上传成功', false);
    },
    onError: err => {
      global.huasen.responseData(res, {}, 'ERROR', err.msg);
    },
  });
  mixtureUpload.uploader(req, res, next);
}

// 检验管理员权限
function checkManagePower(req, res, next) {
  let { proof } = req.huasenJWT;
  global.huasen.working(
    [
      {
        schemaName: 'Manage',
        methodName: 'find',
        payloads: [{ id: proof.key }],
      },
    ],
    manages => {
      if (manages.length > 0) {
        // 放行
        next();
      } else {
        global.huasen.responseData(res, {}, 'FORBIDDEN', '无管理员权限', false);
      }
    },
    req,
  );
}

function checkManageAccountUnique(req, res, next) {
  let { id } = req.huasenParams;
  global.huasen.working(
    [
      {
        schemaName: 'Manage',
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
        global.huasen.responseData(res, {}, 'ERROR', '账号已存在', false);
      }
    },
    req,
  );
}

module.exports = {
  upload,
  uploadIcon,
  checkManagePower,
  checkManageAccountUnique,
};
