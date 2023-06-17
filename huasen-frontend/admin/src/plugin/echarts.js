/*
 * @Autor: huasenjio
 * @Date: 2022-03-26 00:21:32
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-12-10 11:21:18
 * @Description: 按需引入echarts
 */
import Vue from 'vue';

// 引入 ECharts 主模块
const echarts = require('echarts/lib/echarts');
// 引入折线图/柱状图等组件
require('echarts/lib/chart/line');
require('echarts/lib/chart/bar');
require('echarts/lib/chart/radar');
require('echarts/lib/chart/gauge');
require('echarts/lib/chart/pie');
// 引入提示框和title组件和图例
require('echarts/lib/component/tooltip');
require('echarts/lib/component/title');
require('echarts/lib/component/legend');
require('echarts/lib/component/legend');

//图例滚动
require('echarts/lib/component/legendScroll');
require('echarts/lib/component/grid');
require('echarts/lib/component/toolbox');

// 引入水滴图
require('echarts-liquidfill');
// 表哥动态设置
require('echarts/lib/component/dataZoom');

import { TreemapChart } from 'echarts/charts';
echarts.use([TreemapChart]);

//vue全局注入echarts
Vue.prototype.$echarts = echarts;
