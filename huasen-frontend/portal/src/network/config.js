/*
 * @Autor: huasenjio
 * @Date: 2022-06-12 14:23:45
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-11-06 13:37:05
 * @Description: 网络请求默认配置文件
 */

import axios from 'axios';
const CancelToken = axios.CancelToken;
const source = CancelToken.source();
const isDev = process.env.NODE_ENV === 'development';

export default {
  // url前缀
  baseURL: isDev ? '/dev' : '/api',
  // 请求传输格式
  contentType: 'application/x-www-form-urlencoded',
  // 若请求30秒无响应，则取消请求
  timeout: 180000,
  // 请求是否自动携带cookie凭证
  withCredentials: true,
  // 是否全局开启mock
  globalMock: isDev ? true : false,
  // 是否开启加密传输
  globalSecret: isDev ? false : true,
  // 全局开启请求通知
  globalNotify: true,
  // 全局错误通知
  globalErrorNotify: true,
  // 取消请求配置
  cancelToken: source.token,
  // 抛出取消对象，通过source.cancel('请求已经取消')
  source,
};
