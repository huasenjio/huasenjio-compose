/*
 * @Autor: huasenjio
 * @Date: 2021-08-25 01:53:35
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-06-28 22:13:17
 * @Description: 请求构造器
 */
import axios from 'axios'

import Config from './config.js'
import Intercept from './intercept.js'
import { handleParamsToURL } from './utils.js'

/**
 * ajax请求实例
 * @param {Object} option axios配置对象
 * @returns Object Promise对象
 */
export function http(option) {
  // 创建axios配置实例
  const axiosEx = axios.create({
    baseURL: Config.baseURL, // 请求链接前缀
    timeout: Config.timeout, // 30秒后取消请求
    cancelToken: option.cancelToken, // 统一配置可取消请求标识
  })
  // 请求时携带cookie凭证
  axios.defaults.withCredentials = Config.withCredentials
  // 设置数据传输格式
  axiosEx.defaults.headers.post['Content-Type'] = Config.contentType
  // 请求拦截器
  axiosEx.interceptors.request.use(
    Intercept.requestIntercept,
    Intercept.requestError
  )
  // 响应拦截器
  axiosEx.interceptors.response.use(
    Intercept.responseIntercept,
    Intercept.responseError
  )
  return axiosEx(option) // 返回值为promise对象
}

/**
 * JSONP方式进行get网络请求
 * @param {String} url   请求链接
 * @param {Object} data  参数键值对
 * @returns Object Promise对象
 */
export function jsonp(url, data) {
  // 返回一个Promise
  return new Promise((resolve, reject) => {
    // 监听捕获代码是否抛出错误
    try {
      const body = document.body // 获取到body节点对象
      const script = document.createElement('script') // 添加body对象中
      window[data.cb] = function (res) {
        resolve(res) // 处理Promise激活微任务
      }
      url = handleParamsToURL(url, data)
      script.src = url
      body.appendChild(script) // body标签后添加script标签程序自动加载内容
      body.removeChild(script) // 获得参数后移除添加的script标签
    } catch (e) {
      reject(e) // 发生错误时返回拒绝的Promise对象
    }
  })
}
