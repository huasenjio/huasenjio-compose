/*
 * @Autor: huasenjio
 * @Date: 2022-09-28 01:33:06
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-11-01 23:28:05
 * @Description:
 */
/**
 * 处理el-upload组件的action属性接收的api
 * @param {String} api 上传接口，例如：'/admin/upload'
 * @returns String
 */
export function getUploadApi(api) {
  return process.env.NODE_ENV === 'development' ? `/dev${api}` : `/api${api}`;
}
