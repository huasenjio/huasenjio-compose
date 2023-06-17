/**
 * 交换数组元素位置
 * @param {Array}  array   操作数组
 * @param {Number} before 移动前的下标
 * @param {Number} to     移动到的下标
 */
export function exchangeArrayItem(array, before, to) {
  // 保存原位置的对象
  let oldItem = array[to];
  // 开始交换位置
  array.splice(to, 1, array[before]);
  array.splice(before, 1, oldItem);
}