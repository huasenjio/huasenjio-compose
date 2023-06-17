<!--
 * @Autor: huasenjio
 * @Date: 2022-12-11 10:38:25
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-02-02 22:36:04
 * @Description: 
-->

<template>
  <div class="relation-chart">
    <div :id="chartId" class="chart"></div>
  </div>
</template>

<script>
export default {
  name: 'RelationChart',

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
            return `IP地址：${params.data.name} </br> 访问次数：${params.data.value}`;
          },
        },
        animationDurationUpdate: function(idx) {
          // 越往后的数据延迟越大
          return idx * 100;
        },
        animationEasingUpdate: 'bounceIn',
        color: ['#fff', '#fff', '#fff'],
        series: [
          {
            type: 'graph',
            layout: 'force',
            force: {
              repulsion: 500,
              edgeLength: 10,
            },
            roam: true,
            label: {
              normal: {
                show: true,
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
    },
  },
};
</script>

<style lang="scss" scoped>
.relation-chart {
  width: 100%;
  height: 100%;
  .chart {
    width: 100%;
    height: 100%;
  }
}
</style>
