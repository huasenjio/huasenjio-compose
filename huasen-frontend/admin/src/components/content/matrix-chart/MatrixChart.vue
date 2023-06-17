<!--
 * @Autor: huasenjio
 * @Date: 2022-12-10 16:07:51
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-02-02 22:07:07
 * @Description: 词云
-->

<template>
  <div class="matrix-chart">
    <div :id="chartId" class="chart"></div>
  </div>
</template>

<script>
import '@/plugin/echarts-wordcloud.min.js';
export default {
  name: 'MatrixChart',

  props: {
    chartData: {
      type: Array,
      default: () => [],
    },
  },

  watch: {
    chartData: {
      handler(nV) {
        this.initChart();
      },
      deep: true,
    },
  },

  computed: {
    chartId() {
      return String(this.TOOL.getUid(4, 6));
    },
  },

  methods: {
    initChart() {
      let option = {
        tooltip: {
          trigger: 'item',
          formatter: params => {
            return `逆向链接：${params.data.name ? params.data.name : '--'}`;
            // return `逆向链接：${params.data.name ? params.data.name.slice(0, 100) : '--'}`;
          },
        },
        series: [
          {
            type: 'treemap',
            width: '100%',
            height: '100%',
            bottom: '0',
            roam: false,
            nodeClick: false,
            breadcrumb: {
              show: false,
            },
            label: {
              normal: {
                show: true,
                position: ['10%', '40%'],
              },
            },
            itemStyle: {
              normal: {
                show: true,
                textStyle: {
                  color: '#fff',
                  fontSize: 16,
                },
                borderWidth: 8,
                borderColor: '#fff',
              },

              emphasis: {
                label: {
                  show: true,
                },
              },
            },
            data: this.chartData,
          },
        ],
      };

      if (!this.chart) {
        let dom = document.getElementById(this.chartId);
        this.chart = this.$echarts.init(dom);
        // 监听
        this.chartObserve = new ResizeObserver(entries => {
          this.chart.resize();
        });
        this.chartObserve.observe(dom);
        this.$once('hook:beforeDestroy', function() {
          this.chartObserve.unobserve(dom);
        });
      }
      this.chart.setOption(option);
      this.chart.on('click', params => {
        this.TOOL.copyTextToClip(params.name, '拷贝成功');
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.matrix-chart {
  width: 100%;
  height: 100%;
  .chart {
    width: 100%;
    height: 100%;
  }
}
</style>
