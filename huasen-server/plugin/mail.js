/*
 * @Autor: huasenjio
 * @Date: 2021-10-04 12:13:18
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-04 00:36:35
 * @Description: 邮箱验证码系统
 */
const nodemailer = require('nodemailer');
const { MAIL, POOL_MAIL } = require('../config.js');
const { setRedisItem, getRedisItem, delRedisItem } = require('../plugin/ioredis/common.js');
const transporter = nodemailer.createTransport(MAIL); // 创建发送邮箱对象

class Mailer {
  constructor() {
    this.expire = 300; // 验证码生存时间
  }
  /**
   * 存入验证，若账号已有邮箱验证码，则进行覆盖，并且不会延长生存时间
   * @param {String} mail 邮箱地址
   * @param {Number} code 验证码
   */
  saveCode(mail, code) {
    return new Promise((resolve, reject) => {
      setRedisItem(this.getMailRedisKey(mail), code, this.expire)
        .then(stat => {
          resolve({
            key: mail,
            code: code,
          });
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  /**
   * 发送邮箱验证码，并且将验证码存入redis
   * @param {Sting} mail 邮箱地址
   * @param {}      code 验证码
   * @returns
   */
  sendCode(mail, code) {
    return new Promise((resolve, reject) => {
      transporter.sendMail(
        {
          from: `花森提示 <${MAIL.auth.user}>`, // 发送方信息
          to: mail, // 接受者QQ邮箱地址
          subject: '花森主页：n.huasen.cc', // 标题
          text: `邮箱验证码：${code}`, // 文本信息或者html信息
        },
        (err, data) => {
          if (!err) {
            // 验证码存入redis
            this.saveCode(mail, code)
              .then(mailInfo => {
                resolve(mailInfo);
              })
              .catch(err => {
                reject(err);
              });
          } else {
            reject(err);
          }
        },
      );
    });
  }

  /**
   * 删除邮箱验证码
   * @param {String} mail 邮箱地址
   */
  removeCodeByMail(mail) {
    return new Promise((resolve, reject) => {
      delRedisItem(this.getMailRedisKey(mail))
        .then(delCount => {
          resolve(delCount);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  /**
   * 查找验证码，若已存在验证码，则返回验证码，并且延长验证码的生存时间
   * @param {String} mail 邮箱地址
   */
  findCodeByMail(mail) {
    return new Promise((resolve, reject) => {
      getRedisItem(this.getMailRedisKey(mail), this.expire)
        .then(code => {
          resolve(code);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  // 获取邮箱存储于redis里面的key值
  getMailRedisKey(mail) {
    return `${POOL_MAIL}_${mail}`;
  }
}

module.exports = new Mailer();
