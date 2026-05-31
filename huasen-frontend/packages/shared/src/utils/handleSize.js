/**
 * 格式化尺寸
 * @param {String|Number} size - 处理传入尺寸数据，例如：'100px'、'100'、100 = '100px'；'100%' = '100%'
 * @param {String} defaultSize - 默认尺寸
 */
export function formatSize(size, defaultSize = 'fit-content') {
  try {
    if (typeof size === 'string') {
      if (size === 'fit-content') return size;
      if (size === 'auto') return size;
      return /^\d+(\.\d+)?(%|px)$/.test(size) ? size : `${size}px`;
    }
    if (typeof size === 'number') {
      return `${size}px`;
    }
    return defaultSize;
  } catch (err) {
    console.log('formatSize Error：', err);
    return defaultSize;
  }
}

export function handleSize(size, minWidth) {
  return formatSize(size, `${minWidth}px`);
}
