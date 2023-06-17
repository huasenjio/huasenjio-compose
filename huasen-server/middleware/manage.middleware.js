/*
 * @Autor: huasenjio
 * @Date: 2022-10-05 00:22:37
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-19 11:52:23
 * @Description: 管理员中间件
 */
const path = require('path');
const { MixtureUpload } = require('../plugin/mixture-upload/index.js');
const uploadConfigMap = {
  icon: {
    acceptTypes: ['image/jpg', 'image/jpeg', 'image/png'],
    uploadPath: path.resolve(process.cwd(), '../huasen-store/icon'),
  },
  banner: {
    acceptTypes: ['image/jpg', 'image/jpeg', 'image/png'],
    uploadPath: path.resolve(process.cwd(), '../huasen-store/banner'),
  },
  img: {
    acceptTypes: ['image/jpg', 'image/jpeg', 'image/png'],
    uploadPath: path.resolve(process.cwd(), '../huasen-store/img'),
  },
  default: {
    uploadPath: path.resolve(process.cwd(), '../huasen-store/default'),
  },
};

// 上传中间件
function upload(req, res, next) {
  let type = req.huasenParams.type;
  let option = uploadConfigMap[type] || uploadConfigMap['default'];
  const mixtureUpload = new MixtureUpload({
    ...option,
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
  req.epWorking(
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
  );
}

// 检验管理员的最高权限
function checkManageHighestPower(req, res, next) {
  let { proof } = req.huasenJWT;
  req.epWorking(
    [
      {
        schemaName: 'Manage',
        methodName: 'find',
        payloads: [{ id: proof.key, code: proof.code }],
      },
    ],
    manages => {
      if (manages.length > 0) {
        if (manages[0].code === 3) {
          // 放行
          next();
        } else {
          global.huasen.responseData(res, {}, 'ERROR', '管理员权限不足', false);
        }
      } else {
        global.huasen.responseData(res, {}, 'ERROR', '管理员身份非法', false);
      }
    },
  );
}

// 检验管理员唯一
function checkManageAccountUnique(req, res, next) {
  let { id } = req.huasenParams;
  req.epWorking(
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
  );
}

module.exports = {
  upload,
  checkManagePower,
  checkManageAccountUnique,
  checkManageHighestPower,
};
