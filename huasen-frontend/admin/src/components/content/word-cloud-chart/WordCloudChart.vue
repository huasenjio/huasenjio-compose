<!--
 * @Autor: huasenjio
 * @Date: 2022-12-10 16:07:51
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-02-02 22:08:37
 * @Description: 词云
-->

<template>
  <div class="word-cloud">
    <div :id="chartId" class="chart"></div>
  </div>
</template>

<script>
import '@/plugin/echarts-wordcloud.min.js';
export default {
  name: 'WordCloudChart',

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
          show: false,
        },
        series: [
          {
            name: '热点分析',
            type: 'wordCloud',
            textPadding: 4,
            textStyle: {
              normal: {
                color: this.TOOL.randomColor(),
              },
              emphasis: {
                shadowBlur: 10,
                shadowColor: '#333',
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
.word-cloud {
  width: 100%;
  height: 100%;
  .chart {
    width: 100%;
    height: 100%;
  }
}
</style>
