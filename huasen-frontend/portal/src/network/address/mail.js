/*
 * @Autor: huasenjio
 * @Date: 2022-10-22 15:47:52
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-22 15:48:50
 * @Description:
 */
import Mock from 'mockjs2';
import { get, post } from '../request.js';

// 获取邮箱验证码
const getMailCode = get(
  '/mail/getCode',
  {
    key: 'huasenjio@163.com',
    code: 968,
  },
  false,
);

export default {
  getMailCode,
};
