<!--
 * @Autor: huasenjio
 * @Date: 2022-10-04 14:28:44
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-21 00:24:13
 * @Description: 系统相关数据
-->

<template>
  <div class="home-system">
    <div class="store-group shadow">
      <div class="title">磁盘已用占比</div>
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
      disks: [
        { value: 20, name: '根目录' },
        { value: 30, name: '盘1' },
        { value: 25, name: '盘2' },
        { value: 25, name: '盘3' },
        { value: 20, name: '盘4' },
        { value: 35, name: '盘5' },
        { value: 35, name: '盘6' },
      ],
    };
  },

  mounted() {
    this.queryDiskOverview();
  },

  methods: {
    queryDiskOverview() {
      this.API.diskOverview({}, { notify: false }).then(res => {
        this.disks = res.data.map(item => {
          let name = item.diskName.length > 10 ? item.diskName.slice(-10) + '...' : item.diskName;
          let value = item.diskUsed;
          let freeSize = this.bytesToSize(item.diskFree);
          let useSize = this.bytesToSize(item.diskUsed);
          let totalSize = this.bytesToSize(item.diskTotal);
          return {
            name,
            value,
            freeSize,
            useSize,
            totalSize,
          };
        });
        this.initStoreChart();
      });
    },

    initStoreChart() {
      let option = {
        color: ['#37a2da', '#32c5e9', '#9fe6b8', '#ffdb5c', '#ff9f7f', '#fb7293', '#e7bcf3', '#8378ea'],
        tooltip: {
          trigger: 'item',
          formatter: function(item) {
            return `${item.seriesName} </br> 已用磁盘大小：${item.data.freeSize} </br> 剩余空间大小：${item.data.useSize} </br> 磁盘总容量：${item.data.totalSize}`;
          },
        },
        legend: {
          type: 'scroll',
          orient: 'vertical',
          left: 0,
          align: 'left',
          top: 'middle',
          textStyle: {
            color: '#8C8C8C',
          },
          height: 140,
          pageIconColor: '#6495ed', //翻页下一页的三角按钮颜色
          pageIconInactiveColor: '#999', //翻页（即翻页到头时）
          pageIconSize: 12, //翻页按钮大小
          pageButtonItemGap: 0, //翻页按钮的两个之间的间距
        },
        series: [
          {
            name: '硬盘分析',
            type: 'pie',
            radius: [0, 80],
            center: ['70%', '50%'],
            label: {
              show: false,
            },
            data: this.disks,
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
    width: 380px;
    height: 220px;
    padding: 10px;
    border: 1px solid var(--gray-50);
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
