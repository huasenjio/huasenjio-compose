/*
 * @Autor: huasenjio
 * @Date: 2022-09-28 01:33:06
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-04 00:30:44
 * @Description:
 */
const defaultSettings = {
  watermark_txt: 'admin',
  watermark_x: 50, // 起始位置x轴坐标
  watermark_y: 50, // 起始位置Y轴坐标
  watermark_rows: 0, // 行数
  watermark_cols: 20, // 列数
  watermark_x_space: 100, // x轴间隔
  watermark_y_space: 50, // y轴间隔
  watermark_color: '#cccccc', // 字体颜色
  watermark_alpha: 0.08, // 透明度
  watermark_fontsize: '14px', // 字体大小
  watermark_font: '微软雅黑', // 字体
  watermark_width: 200, // 宽度
  watermark_height: 80, // 长度
  watermark_angle: 15, // 倾斜度数
  element: document.body,
};

export default defaultSettings;
