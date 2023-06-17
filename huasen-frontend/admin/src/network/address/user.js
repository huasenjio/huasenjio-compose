/*
 * @Autor: huasenjio
 * @Date: 2022-10-07 17:58:58
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-25 21:25:35
 * @Description: 用户接口地址
 */
const Mock = require('mockjs2');
import { get, post } from '../request.js';

const findUserByPage = post('/user/findByPage');
const addUser = post('/user/add');
const removeUser = post('/user/remove');
const updateUser = post('/user/update');

export { findUserByPage, addUser, removeUser, updateUser };
