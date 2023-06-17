/**
 * 对象深拷贝函数
 * @param {object} object
 * @retures 拷贝后的对象
 */
export function copyObject(object) {
  let obj = object instanceof Array ? [] : {} // 判断是数组或者对象进行声明变量
  // 解构获得键值对
  for (const [k, v] of Object.entries(object)) {
    obj[k] = typeof v == 'object' ? copyObject(v) : v // 如果当前属性是引用类型则递归调用，基础数据类型则直接赋值
  }
  return obj // 返还对象
}