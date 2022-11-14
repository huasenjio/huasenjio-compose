const fs = require('fs');
const path = require('path');

const multiparty = require('./multiparty');
const { STORE } = require('../../config.js');
const { createDirSync } = require('../../utils/tool.js');

class MixtureUpload {
  constructor(options = {}) {
    this.data = {};
    this.files = {};
    this.finishCount = 0;
    // 配置合并
    this.config = Object.assign(STORE, options);
    // 初始化上传地址
    this.initUploadDir();
  }

  // 初始化，存储路径，若不存在路径，则创建目录
  initUploadDir() {
    if (!fs.existsSync(this.config.uploadPath)) {
      createDirSync(this.config.uploadPath);
    }
  }

  // 整合表单
  handleFormData(name, value, data) {
    if (Array.isArray(data[name])) {
      data[name].push(value);
    } else if (data[name]) {
      data[name] = [data[name], value];
    } else {
      data[name] = value;
    }
    this.finishCount++;
  }

  // 上传中间件
  uploader(req, res, next) {
    if (req.method === 'GET' || req.method === 'HEAD') next();
    if (!req.is('multipart/form-data')) next();
    // 实例化表单接收器
    const form = new multiparty.Form({
      encoding: this.config.encoding,
      maxFieldsSize: this.config.maxFieldsSize,
      maxFields: this.config.maxFields,
      maxFilesSize: this.config.maxFilesSize,
      autoFiles: this.config.autoFiles,
    });
    form.parse(req);
    // 监听上传的类型为text类型的表单项
    form.on('field', (name, value) => {
      this.handleFormData(name, value, this.data);
    });
    // 监听上传的文件类型的表单项
    form.on('file', (name, file) => {
      try {
        let fileEx = file.path.split('.').pop();
        let filesFilter = this.config.handleFilter;
        let pass = filesFilter ? filesFilter(file) : true;
        if (pass) {
          // 判断文件类型
          let fileMINE = file.headers['content-type'];
          let isAcceptIndex = this.config.acceptTypes.indexOf(fileMINE);
          if (isAcceptIndex < 0) {
            throw new Error(`${fileMINE}文件类型不允许`);
          } else {
            // 文件重命名
            let newFileName = this.config.handleFileName ? this.config.handleFileName(file) : `${Date.now()}`;
            let newFilePath = path.resolve(this.config.uploadPath, `${newFileName}.${fileEx}`);
            // 移动文件，本地持久化
            // fix：修复docker-compose中跨区写入文件的错误
            let readStream = fs.createReadStream(file.path);
            let writeStream = fs.createWriteStream(newFilePath);
            let tempFilePath = file.path;
            readStream.pipe(writeStream);
            // 监听写入完成
            readStream.on('end', function () {
              fs.unlinkSync(tempFilePath);
            });
            file.path = newFilePath;
            this.handleFormData(name, file, this.files);
          }
        } else {
          throw new Error('文件被过滤拦截');
        }
      } catch (err) {
        fs.unlinkSync(file.path);
        global.huasen.formatError(err);
      }
    });
    // 监听错误
    form.on('error', err => {
      let error = {};
      switch (err.tag) {
        case 'length':
          error.msg = `文件大小超过 ${(this.config.maxFilesSize / (1024 * 1024)).toFixed(2)} M`;
          break;
        case 'maxFieldsSize':
          error.msg = `字段大小超过 ${(this.config.maxFieldsSize / (1024 * 1024)).toFixed(2)} M`;
          break;
        case 'maxFields':
          error.msg = `上传目标超过 ${this.config.maxFields} 个`;
          break;
        default:
          error.msg = '上传时发生未知错误';
          break;
      }
      error.tag = err.tag;
      error.originError = err.toString();
      // 执行错误毁掉
      if (this.config.onError) this.config.onError(error);
    });
    // 监听表单处理完成自动关闭
    form.on('close', () => {
      if (this.finishCount < form.totalFieldCount) return false;
      // 必需的回调
      if (this.config.onSuccess) this.config.onSuccess(this.data, this.files);
    });
  }
}

module.exports = {
  MixtureUpload,
};
