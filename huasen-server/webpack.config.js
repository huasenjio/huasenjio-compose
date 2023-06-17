/*
 * @Autor: huasenjio
 * @Date: 2022-01-18 00:13:03
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-11-19 21:52:00
 * @Description: 编译精灵图配置
 */

const path = require('path');
const SpritesmithPlugin = require('webpack-spritesmith');
const { templateFunction, spriteIconPath } = require('./spritesmith.config.js');
const FileManagerPlugin = require('filemanager-webpack-plugin');

module.exports = {
  entry: {},
  output: {},
  plugins: [
    new FileManagerPlugin({
      events: {
        onStart: {
          copy: [{ source: './public/default/spriteImg/*.png', destination: spriteIconPath }],
        },
      },
    }),
    new SpritesmithPlugin({
      src: {
        cwd: path.resolve(__dirname, spriteIconPath), // 图标的位置
        glob: '*.png', // 图标的后缀
      },
      target: {
        image: path.resolve(__dirname, './public/webapp/sprite.png'), // 输出精灵图的位置
        css: [
          [
            // 精灵样式输出的路径和格式
            path.resolve(__dirname, './public/webapp/sprite.css'),
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
      // 精灵图的引用前缀
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
    modules: ['node_modules', spriteIconPath],
  },
  mode: 'development',
};
