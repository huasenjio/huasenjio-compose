<!--
 * @Autor: huasenjio
 * @Date: 2022-10-04 10:39:39
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-05-14 23:59:52
 * @Description: 访客统计
-->

<template>
  <div class="home-visitor">
    <div class="left shadow">
      <div id="visitor-chart"></div>
    </div>
    <div class="right shadow">
      <div class="total-text-group">
        <div class="label text">实时访客总数(PV)：{{ visitorCount | emptyTip }}</div>
        <div class="rate text">{{ visitorRate | emptyTip }} 同昨日比较</div>
      </div>
      <div id="total-chart"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeVisitor',

  props: {
    visitor: {
      type: Object,
      default: () => {},
    },
  },

  watch: {
    visitor() {
      this.initVisitorChart();
    },
  },

  data() {
    return {
      visitorCount: 0,
      visitorRate: '',
      totalData: [],
      totalTime: [],
    };
  },

  mounted() {
    this.queryVisitorTotal();
    this.queryVisitor();
  },

  // activated() {
  //   this.queryVisitorTotal();
  //   this.queryVisitor();
  // },

  methods: {
    queryVisitorTotal() {
      this.API.uvOverview(
        {},
        {
          notify: false,
        },
      ).then(res => {
        let vTemp = [];
        let tTemp = [];
        res.data.reverse().forEach(element => {
          vTemp.push(element.count);
          tTemp.push(element.time);
        });
        this.totalData = vTemp;
        this.totalTime = tTemp;
        // 绘制数据
        this.initTotalChart();
      });
    },

    queryVisitor() {
      this.API.visitor(
        {},
        {
          notify: false,
        },
      ).then(res => {
        this.visitorCount = res.data.visitorCount;
        this.visitorRate = res.data.visitorRate;
      });
    },

    initVisitorChart() {
      let option = {
        grid: {
          left: '10',
          right: '10',
          top: '40',
          bottom: '40',
          containLabel: true,
        },
        tooltip: {
          show: true,
          trigger: 'axis',
        },
        legend: {
          show: true,
          x: '520',
          y: '10',
          icon: 'stack',
          itemWidth: 15,
          itemHeight: 10,
          data: ['用户', '管理员', '访客'],
        },
        xAxis: [
          {
            type: 'category',
            axisLine: {
              show: false,
            },
            axisLabel: {
              color: '#A1A7B3',
            },
            splitLine: {
              show: false,
            },
            axisTick: {
              show: false,
            },
            data: this.visitor.time,
          },
        ],
        dataZoom: [
          {
            show: true,
            height: 18,
            xAxisIndex: [0],
            left: '0',
            right: '6',
            bottom: '14',
            start: 0,
            end: 100,
            textStyle: {
              color: '#8c8c8c',
            },
            borderColor: '#8c8c8c',
          },
          {
            show: true,
            type: 'inside',
            height: 15,
            start: 2,
            end: 35,
          },
        ],
        yAxis: [
          {
            type: 'value',
            name: '流量监控',
            nameTextStyle: {
              fontSize: 14,
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: '#A1A7B3',
                type: 'dashed',
              },
            },
            axisLine: {
              show: true,
              lineStyle: {
                color: '#8c8c8c',
              },
            },
            axisLabel: {
              show: true,
              margin: 10,
              textStyle: {
                color: '#A1A7B3',
              },
            },
            axisTick: {
              show: false,
            },
          },
        ],
        series: [
          {
            name: '用户',
            type: 'line',
            smooth: true,
            stack: '用户',
            symbolSize: 0,
            itemStyle: {
              normal: {
                color: '#4293FD',
                lineStyle: {
                  color: '#4293FD',
                  width: 2,
                },
              },
            },
            areaStyle: {
              normal: {
                color: this.$echarts.graphic.LinearGradient(
                  0,
                  0,
                  0,
                  1,
                  [
                    {
                      offset: 0,
                      color: 'rgba(19, 95, 172, 1)',
                    },
                    {
                      offset: 1,
                      color: 'rgba(112, 154, 195, 0.4)',
                    },
                  ],
                  false,
                ),
              },
            },
            data: this.visitor.user,
          },
          {
            name: '管理员',
            type: 'line',
            smooth: true,
            stack: '管理员',
            symbolSize: 0,
            itemStyle: {
              normal: {
                color: '#23D0C4',
                lineStyle: {
                  color: '#23D0C4',
                  width: 2,
                },
              },
            },
            areaStyle: {
              normal: {
                color: new this.$echarts.graphic.LinearGradient(
                  0,
                  0,
                  0,
                  1,
                  [
                    {
                      offset: 0,
                      color: 'rgba(50, 216, 205, 1)',
                    },
                    {
                      offset: 1,
                      color: 'rgba(35, 208, 196, 0.4)',
                    },
                  ],
                  false,
                ),
              },
            },
            data: this.visitor.admin,
          },
          {
            name: '访客',
            type: 'line',
            smooth: true,
            stack: '访客',
            symbolSize: 0,
            itemStyle: {
              normal: {
                color: '#fbc607',
                lineStyle: {
                  color: '#fbc607',
                  width: 2,
                },
              },
            },
            areaStyle: {
              normal: {
                color: new this.$echarts.graphic.LinearGradient(
                  0,
                  0,
                  0,
                  1,
                  [
                    {
                      offset: 0,
                      color: 'rgba(250, 199, 6, 1)',
                    },
                    {
                      offset: 1,
                      color: 'rgba(245, 133, 72, 0.4)',
                    },
                  ],
                  false,
                ),
              },
            },
            data: this.visitor.other,
          },
        ],
      };
      if (!this.chart) {
        let dom = document.getElementById('visitor-chart');
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

    initTotalChart() {
      let option = {
        tooltip: {
          show: true,
        },
        grid: {
          left: '0',
          right: '20',
          top: '0',
          bottom: '0',
          containLabel: true,
        },
        color: ['#2db4f6', '#7c59c2'],
        xAxis: [
          {
            type: 'value',
            axisLabel: {
              formatter: '{value} 人',
              rotate: 35,
              fontSize: 12,
            },
          },
        ],
        yAxis: [
          {
            type: 'category',
            data: this.totalTime,
            axisPointer: {
              type: 'shadow',
            },
          },
        ],
        series: [
          {
            name: 'PV',
            type: 'bar',
            barWidth: '30%',
            data: this.totalData,
          },
        ],
      };
      if (!this.totalChart) {
        let dom = document.getElementById('total-chart');
        this.totalChart = this.$echarts.init(dom);
        // 监听
        this.totalChartObserve = new ResizeObserver(entries => {
          this.totalChart.resize();
        });
        this.totalChartObserve.observe(dom);
        this.$once('hook:beforeDestroy', function() {
          this.totalChartObserve.unobserve(dom);
        });
      }
      this.totalChart.setOption(option);
    },
  },
};
</script>

<style lang="scss" scoped>
.home-visitor {
  // margin-top: 10px;
  padding: 10px;
  display: flex;
  .left {
    width: 700px;
    height: 300px;
    border-radius: 2px;
    border: 1px solid var(--gray-50);
    #visitor-chart {
      width: 100%;
      height: 100%;
    }
  }
  .right {
    width: calc(100% - 700px - 10px);
    padding: 10px;
    margin-left: 10px;
    border: 1px solid var(--gray-50);
    .total-text-group {
      width: 100%;
      height: 54px;
      .label {
        color: var(--gray-600);
      }
      .rate {
        font-size: 12px;
        color: var(--gray-500);
      }
    }
    #total-chart {
      width: 100%;
      height: calc(100% - 54px);
    }
  }
}
</style>
