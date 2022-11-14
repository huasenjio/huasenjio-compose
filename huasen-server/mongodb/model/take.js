/*
 * @Autor: huasenjio
 * @Date: 2022-10-10 22:52:20
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-31 22:25:45
 * @Description: 发布者表
 */

const mongoose = require('mongoose');

// 创建schema实例表对象
let TakeSchema = new mongoose.Schema({
  // 昵称
  name: {
    type: String,
    minlength: [4, '名称长度不小于4'],
    maxlength: [8, '名称长度不大于8'],
  },

  // 权限码(0-3)
  code: {
    type: Number,
    default: 0,
    validate: {
      validator: function (code) {
        try {
          if (!Number.isInteger(code)) false;
          if (0 <= code && code <= 3) return true;
        } catch (error) {
          return false;
        }
      },
      message: '请输入0-3范围的权限码',
    },
  },

  // 账号是否可用
  enabled: {
    type: Boolean,
    default: true,
  },

  // 收藏的网站
  series: {
    type: String,
    default: '[]',
    validate: {
      validator: function (desc) {
        try {
          let serie = JSON.parse(desc);
          if (Object.prototype.toString.call(serie) === '[object Array]') {
            return serie.every(type => {
              // 类型格式
              let typeStruc = Object.prototype.toString.call(type) === '[object Object]' && type.hasOwnProperty('typeName') && type.hasOwnProperty('sites');
              // 网站格式
              let siteStruc = type['sites'].every(site => {
                return site.hasOwnProperty('name') && site.hasOwnProperty('url') && site.hasOwnProperty('icon') && site.hasOwnProperty('describe') && site.hasOwnProperty('remark');
              });
              return typeStruc && siteStruc;
            });
          }
        } catch (err) {
          return false;
        }
      },
      message: '请输入正确[]格式的JSON',
    },
  },

  // 配置
  config: {
    type: String,
    default: '{}',
    validate: {
      validator: function (desc) {
        try {
          let config = JSON.parse(desc);
          if (Object.prototype.toString.call(config) === '[object Object]') {
            let pureFlag = config['wallpaper'].every(site => {
              return site.hasOwnProperty('headerFontColor') && site.hasOwnProperty('background');
            });
            let wallpaperFlag = config['pure'].every(site => {
              return site.hasOwnProperty('color') && site.hasOwnProperty('background');
            });
            // 一假则假
            return pureFlag && wallpaperFlag;
          }
        } catch (err) {
          return false;
        }
      },
      message: '请输入正确{}格式的JSON',
    },
  },
});

const Take = mongoose.model('takes', TakeSchema);
module.exports = Take;
