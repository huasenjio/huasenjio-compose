<!--
 * @Autor: huasenjio
 * @Date: 2022-10-04 14:28:44
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-06-15 00:48:04
 * @Description: 系统相关数据
-->

<template>
  <div class="home-system">
    <div class="store-group shadow">
      <div class="title">磁盘使用情况</div>
      <!-- 文字 -->
      <div class="disk-text text">
        <div class="text-item text">磁盘名：{{ disk.diskName }}</div>
        <div class="text-item text">已用容量：{{ disk.freeValue }}</div>
        <div class="text-item text">已用占比：{{ disk.useUsage * 100 + '%' }}</div>
        <div class="text-item text">空闲容量：{{ disk.useValue }}</div>
        <div class="text-item text">总磁盘容量：{{ disk.totalValue }}</div>
      </div>
      <!-- 水滴图 -->
      <div id="disk-chart"></div>
    </div>
    <div class="memory-group shadow">
      <div id="memory-chart"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeSystem',

  props: {
    system: {
      type: Object,
      default: () => {
        return {
          time: [],
          cpu: [],
          memory: [],
        };
      },
    },
  },

  watch: {
    system(nV, oV) {
      this.initMemoryChart();
    },
  },

  data() {
    return {
      disk: {
        diskName: '默认磁盘',
        freeValue: '50G',
        totalValue: '100G',
        useValue: '50G',
        useUsage: 0.5,
      },
    };
  },

  mounted() {
    this.queryDiskOverview();
  },

  methods: {
    queryDiskOverview() {
      this.API.diskOverview({}, { notify: false }).then(res => {
        this.disk = res.data;
        this.initStoreChart();
      });
    },

    initStoreChart() {
      let option = {
        series: [
          {
            type: 'liquidFill',
            radius: '80%',
            color: [
              '#fbc607',
              '#21d0c3',
              this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: '#4293fd',
                },
                {
                  offset: 0.8,
                  color: '#4293fd',
                },
              ]),
            ],
            data: [this.disk.useUsage, this.disk.useUsage, this.disk.useUsage],
            center: ['70%', '50%'],
            label: {
              normal: {
                formatter: this.disk.useUsage * 100 + '%',
                fontSize: 18,
                fontWeight: 400,
                color: '#555',
              },
            },
            itemStyle: {
              opacity: 0.6, // 波浪的透明度
              shadowBlur: 0, // 波浪的阴影范围
            },
            emphasis: {
              itemStyle: {
                opacity: 0.8, // 鼠标经过波浪颜色的透明度
              },
            },
            outline: {
              borderDistance: 2,
              itemStyle: {
                borderColor: '#5fa5fa',
                borderWidth: 4,
                // shadowBlur: 20,
              },
            },
            backgroundStyle: {
              color: '#fff',
            },
          },
        ],
      };
      this.storeChart = this.$echarts.init(document.getElementById('disk-chart'));
      this.storeChart.setOption(option);
    },

    initMemoryChart() {
      let option = (option = {
        title: {
          text: 'CPU/内存占用率',
          textStyle: {
            align: 'center',
            color: '#8c8c8c',
            fontSize: 12,
          },
          top: '6',
          left: '0',
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        grid: {
          left: '10',
          right: '10',
          bottom: '15%',
          top: '18%',
          containLabel: true,
        },
        legend: {
          data: ['CPU', '内存'],
          right: 10,
          top: 12,
          textStyle: {
            color: '#8c8c8c',
          },
          itemWidth: 12,
          itemHeight: 10,
        },
        xAxis: {
          type: 'category',
          data: this.system.time,
          axisLine: {
            lineStyle: {
              color: '#8c8c8c',
            },
          },
          axisLabel: {
            textStyle: {
              fontFamily: 'Microsoft YaHei',
            },
          },
        },
        yAxis: {
          type: 'value',
          max: '100',
          axisLine: {
            show: false,
            lineStyle: {
              color: '#8c8c8c',
            },
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.3)',
            },
          },
        },
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
            type: 'inside',
            show: true,
            height: 15,
            start: 2,
            end: 35,
          },
        ],
        series: [
          {
            name: 'CPU',
            type: 'bar',
            barWidth: '15%',
            itemStyle: {
              normal: {
                color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: '#fccb05',
                  },
                  {
                    offset: 1,
                    color: '#f5804d',
                  },
                ]),
                barBorderRadius: 12,
              },
            },
            data: this.system.cpu,
          },
          {
            name: '内存',
            type: 'bar',
            barWidth: '15%',
            itemStyle: {
              normal: {
                color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: '#248ff7',
                  },
                  {
                    offset: 1,
                    color: '#6851f1',
                  },
                ]),
                barBorderRadius: 11,
              },
            },
            data: this.system.memory,
          },
        ],
      });
      if (!this.memoryChart) {
        let dom = document.getElementById('memory-chart');
        this.memoryChart = this.$echarts.init(dom);
        this.memoryChartObserve = new ResizeObserver(entries => {
          this.memoryChart.resize();
        });
        this.memoryChartObserve.observe(dom);
        this.$once('hook:beforeDestroy', function() {
          this.memoryChartObserve.unobserve(dom);
        });
      }
      this.memoryChart.setOption(option);
    },

    bytesToSize(bytes) {
      if (bytes === 0) return '0 B';
      let k = 1000; // or 1024
      let sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      let i = Math.floor(Math.log(bytes) / Math.log(k));
      return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
    },
  },
};
</script>

<style lang="scss" scoped>
.home-system {
  width: 100%;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--gray-600);
  .store-group {
    position: relative;
    width: 380px;
    height: 220px;
    padding: 10px;
    border: 1px solid var(--gray-50);
    .disk-text {
      position: absolute;
      top: 48px;
      .text-item {
        width: 140px;
        font-size: 14px;
        margin-top: 8px;
        color: var(--gray-500);
      }
    }
    #disk-chart {
      width: 100%;
      height: 180px;
    }
  }
  .memory-group {
    width: calc(100% - 380px - 10px);
    height: 220px;
    margin-left: 10px;
    border: 1px solid var(--gray-50);
    #memory-chart {
      width: 100%;
      height: 220px;
    }
  }
}
</style>
