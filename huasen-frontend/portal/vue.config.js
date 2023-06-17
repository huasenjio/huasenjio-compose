/*
 * @Autor: huasenjio
 * @Date: 2021-08-25 01:53:35
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-24 22:37:59
 * @Description: 项目配置文件
 */
const path = require('path');
const SpritesmithPlugin = require('webpack-spritesmith');
const { templateFunction } = require('./spritesmith.config.js');

function resolve(dir) {
  return path.join(__dirname, dir);
}

module.exports = {
  outputDir: '../../huasen-server/public/webapp/portal', // 输出路径
  publicPath: './',
  transpileDependencies: ['highlight.js'],
  productionSourceMap: false,
  runtimeCompiler: true, // 运行时编译
  configureWebpack: config => {
    // 配置雪碧图
    const Plugins = [
      new SpritesmithPlugin({
        src: {
          cwd: path.resolve(__dirname, './src/assets/icon'), // 图标的位置
          glob: '*.png', // 图标的后缀
        },
        target: {
          image: path.resolve(__dirname, './src/assets/sprite-icon/sprite.png'), // 输出精灵图的位置
          css: [
            [
              // 精灵样式输出的路径和格式
              path.resolve(__dirname, './src/assets/sprite-icon/sprite.css'),
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
    // 生产环境配置打包文件大小
    if (process.env.NODE_ENV === 'production') {
      // 代码大小显示
      config.performance = {
        maxEntrypointSize: 1000000,
        maxAssetSize: 3000000,
      };
      // 代码分割
      config.optimization = {
        splitChunks: {
          cacheGroups: {
            common: {
              name: 'chunk-common',
              chunks: 'initial',
              minChunks: 2,
              maxInitialRequests: 5,
              minSize: 0,
              priority: 1,
              reuseExistingChunk: true,
              enforce: true,
            },
            vendors: {
              name: 'chunk-vendors',
              test: /[\\/]node_modules[\\/]/,
              chunks: 'initial',
              priority: 2,
              reuseExistingChunk: true,
              enforce: true,
            },
            elementUI: {
              name: 'chunk-element',
              test: /[\\/]node_modules[\\/]element-ui[\\/]/,
              chunks: 'all',
              priority: 3,
              reuseExistingChunk: true,
              enforce: true,
            },
            echarts: {
              name: 'chunk-echarts',
              test: /[\\/]node_modules[\\/](vue-)?echarts[\\/]/,
              chunks: 'all',
              priority: 4,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      };
    }
    // 索引资源
    config.resolve.modules = ['node_modules', './src/assets/icon'];
    // 配置插件
    config.plugins = [...config.plugins, ...Plugins];
  },
  //  配置别名
  chainWebpack: config => {
    // 命名别名
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
    port: 9527, // 端口
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
