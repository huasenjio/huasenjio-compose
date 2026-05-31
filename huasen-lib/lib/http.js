import axios from "axios";

/**
 * 发送 JSON POST 请求
 * @param {String} urlStr - 请求地址
 * @param {Object} data - 请求体数据
 * @param {Object} options - 可选配置 { headers, timeout }
 * @returns {Promise<{ statusCode: Number, body: Object }>}
 */
export function postJSON(urlStr, data, options = {}) {
  return axios
    .post(urlStr, data, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      timeout: options.timeout,
    })
    .then((response) => ({
      statusCode: response.status,
      body: response.data,
    }));
}

/**
 * 发送 JSON GET 请求
 * @param {String} urlStr - 请求地址
 * @param {Object} options - 可选配置 { headers, timeout }
 * @returns {Promise<{ statusCode: Number, body: Object }>}
 */
export function getJSON(urlStr, options = {}) {
  return axios
    .get(urlStr, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      timeout: options.timeout,
    })
    .then((response) => ({
      statusCode: response.status,
      body: response.data,
    }));
}
