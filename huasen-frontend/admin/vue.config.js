/*
 * @Autor: huasenjio
 * @Date: 2021-08-25 01:53:35
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-31 01:07:26
 * @Description:
 */
const path = require('path');

const SpritesmithPlugin = require('webpack-spritesmith');
const { templateFunction } = require('./spritesmith.config.js');

function resolve(dir) {
  return path.join(__dirname, dir);
}

module.exports = {
  outputDir: '../../huasen-server/public/webapp/admin', // 输出路径
  publicPath: './',
  productionSourceMap: false,
  runtimeCompiler: true, // 运行时编译
  configureWebpack: config => {
    config.resolve.modules = ['node_modules', './src/assets/icon'];
    const Plugins = [
      new SpritesmithPlugin({
        src: {
          cwd: path.resolve(__dirname, './src/assets/icon'), // 图标的位置
          glob: '*.png', // 图标的后缀
        },
        target: {
          image: path.resolve(__dirname, './src/assets/sprite/sprite.png'), // 输出精灵图的位置
          css: [
            [
              // 精灵样式输出的路径和格式
              path.resolve(__dirname, './src/assets/sprite/sprite.css'),
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
    ];
    config.plugins = [...config.plugins, ...Plugins];
  },
  //  配置别名
  chainWebpack: config => {
    config.resolve.alias
      .set('@', resolve('src'))
      .set('assets', resolve('src/assets'))
      .set('components', resolve('src/components'))
      .set('constant', resolve('src/constant'))
      .set('network', resolve('src/network'))
      .set('constant', resolve('src/constant'))
      .set('network', resolve('src/network'))
      .set('utils', resolve('src/utils'))
      .set('plugin', resolve('src/plugin'))
      .set('config', resolve('src/config'))
      .set('views', resolve('src/views'))
      .set('public', resolve('../src/public')); // 静态资源目录
  },
  css: {
    loaderOptions: {
      // 样式文件通常需要style-loader(0)，css-loader(1)，postcss-loader(2)，sass-loader(3)处理
      css: {
        // css文件中通过@import引入前，需要先经过第几位loader开始处理，此处3为了支持css中引入scss文件
        importLoaders: 3,
      },
      sass: {
        implementation: require('sass'), // This line must in sass option
      },
    },
  },
  devServer: {
    open: false,
    inline: true,
    hot: true, // 热更新
    host: '0.0.0.0', // 允许外部ip访问
    port: 9000, // 端口
    https: false, // 启用https
    proxy: {
      '^/dev': {
        target: 'http://localhost:3000',
        pathRewrite: { '^/dev': '' },
      },
      '^/huasen-store': {
        target: 'http://localhost:3000',
      },
    },
  },
};
