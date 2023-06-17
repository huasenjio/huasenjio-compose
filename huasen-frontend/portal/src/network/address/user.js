/*
 * @Autor: huasenjio
 * @Date: 2022-09-06 21:34:24
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-24 23:15:40
 * @Description: 用户相关接口
 */

import Mock from 'mockjs2';
import { get, post } from '../request.js';

const login = post('/user/login');
const register = post('/user/register');
const updatePassword = post('/user/updatePassword');
const backup = post('/user/backup');
const consistentFromCloud = post('/user/consistentFromCloud');

export default {
  login,
  register,
  updatePassword,
  backup,
  consistentFromCloud,
};
