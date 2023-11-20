/*
 * @Autor: huasenjio
 * @Date: 2023-11-19 15:24:22
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-11-19 15:24:22
 * @Description: JSON字符串转对象
 */

export function parseJSON(JSONString, defValue) {
  try {
    let obj = JSON.parse(JSONString);
    return obj;
  } catch (err) {
    console.log(err);
    return defValue;
  }
}
