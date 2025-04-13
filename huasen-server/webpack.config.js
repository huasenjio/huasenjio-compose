/*
 * @Autor: huasenjio
 * @Date: 2022-01-18 00:13:03
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-11-19 21:52:00
 * @Description: 编译精灵图配置
 */

const path = require('path');
const SpritesmithPlugin = require('webpack-spritesmith');
const { templateFunction, iconPath, spriteImgPath, spriteCssPath } = require('./spritesmith.config.js');
const FileManagerPlugin = require('filemanager-webpack-plugin');

module.exports = {
  entry: {},
  output: {},
  plugins: [
    // 打包完成后移动精灵图和样式文件
    // new FileManagerPlugin({
    //   events: {
    //     onStart: {
    //       copy: [{ source: '', destination: '' }],
    //     },
    //   },
    // }),
    new SpritesmithPlugin({
      src: {
        cwd: iconPath, // 图标的位置
        glob: '*.png', // 图标的后缀
      },
      // 输出精灵图的位置和样式
      target: {
        image: spriteImgPath,
        css: [
          [
            spriteCssPath,
            {
              // 标记引用自己的模板
              format: 'function_based_template',
            },
          ],
        ],
      },
      // 精灵图和精灵使用的格式方法
      customTemplates: {
        function_based_template: templateFunction,
      },
      // CSS中引用精灵图的路径
      apiOptions: {
        cssImageRef: './sprite.png',
      },
      // 精灵之间的间隔
      spritesmithOptions: {
        padding: 20,
      },
    }),
  ],
  resolve: {
    modules: ['node_modules', iconPath],
  },
  mode: 'development',
};
