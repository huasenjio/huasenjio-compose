<!--
 * @Autor: huasenjio
 * @Date: 2021-08-25 01:53:35
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-18 11:55:52
 * @Description: 仪表盘页面
-->
<template>
  <div class="home">
    <el-alert title="温馨提示：数据表盘实时统计大量数据，常驻后台会消耗较多性能，可能导致接口请求变慢！" type="warning" show-icon> </el-alert>
    <HomeOverview></HomeOverview>
    <HomeVisitor :visitor="visitorStatus"></HomeVisitor>
    <HomeSystem :system="systemStatus"></HomeSystem>
    <el-tabs class="tab-group" type="border-card">
      <el-tab-pane>
        <span slot="label">
          <i class="el-icon-place"></i>
          UV矩阵
          {{ uvs.length }}
        </span>
        <div class="w-full h-px-400">
          <HomeRelation :chartData="uvs"></HomeRelation>
        </div>
      </el-tab-pane>
      <el-tab-pane>
        <span slot="label">
          <i class="el-icon-aim"></i>
          逆向链接
          {{ referers.length }}
        </span>
        <div class="w-full h-px-400">
          <HomeMatrix :chartData="referers"></HomeMatrix>
        </div>
      </el-tab-pane>
      <el-tab-pane>
        <span slot="label">
          <i class="el-icon-coin"></i>
          主机记录
          {{ hosts.length }}
        </span>
        <div class="w-full h-px-400">
          <HomeWordCloud :chartData="hosts"></HomeWordCloud>
        </div>
      </el-tab-pane>
      <el-tab-pane>
        <span slot="label">
          <i class="el-icon-connection"></i>
          操作记录
          {{ traces.length }}
        </span>
        <div class="w-full h-px-400">
          <HomeSheet :tableData="traces" :tableMap="tracesMap"></HomeSheet>
        </div>
      </el-tab-pane>
      <el-tab-pane>
        <span slot="label">
          <i class="el-icon-view"></i>
          在线人数
          {{ onlines.length }}
        </span>
        <div class="w-full h-px-400">
          <HomeSheet :tableData="onlines" :tableMap="onlinesMap" :showOffline="true" @offline="handleOffline"></HomeSheet>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import HomeOverview from './overview/HomeOverview.vue';
import HomeVisitor from './visitor/HomeVisitor.vue';
import HomeSystem from './system/HomeSystem.vue';

import HomeMatrix from '@/components/content/matrix-chart/MatrixChart.vue';
import HomeRelation from '@/components/content/relation-chart/RelationChart.vue';
import HomeSheet from '@/components/content/sheet/Sheet.vue';
import HomeWordCloud from '@/components/content/word-cloud-chart/WordCloudChart.vue';

import { mapState } from 'vuex';
export default {
  name: 'Home',

  components: {
    HomeOverview,
    HomeVisitor,
    HomeSystem,
    HomeMatrix,
    HomeRelation,
    HomeWordCloud,
    HomeSheet,
  },

  data() {
    return {
      // 连接对象
      ws: null,
      // 定时轮询对象
      timer: null,
      // 系统状态信息
      systemStatus: {
        time: ['00:00:01', '00:00:02'],
        cpu: [10, 20],
        memory: [20, 10],
      },

      // 访问数据
      uvs: [],
      hosts: [],
      referers: [],
      traces: [],
      tracesMap: [
        {
          label: '动作',
          key: 'operateName',
        },
        {
          label: '链接',
          key: 'url',
        },
        {
          label: '站点',
          key: 'host',
        },
        {
          label: 'IP',
          key: 'ip',
          width: '80',
        },
        {
          label: '逆链',
          key: 'referer',
        },
        {
          label: '请求方式',
          key: 'method',
        },
        {
          label: '有效载荷',
          key: 'payload',
        },
        {
          label: '时间',
          key: 'time',
          width: '160',
        },
        {
          label: '等待时间（ms）',
          key: 'waitTime',
          width: '135',
        },
        {
          label: '响应时间（ms）',
          key: 'responseTime',
          width: '135',
        },
      ],
      onlines: [],
      onlinesMap: [
        {
          label: '账号',
          key: 'id',
        },
        {
          label: '票据',
          key: 'token',
        },
        {
          label: '有效期',
          key: 'ttl',
        },
      ],

      // 访问数据
      visitorStatus: {
        time: ['00:00:01', '00:00:02', '00:00:03'],
        user: [0, 3, 1],
        admin: [0, 2, 2],
        other: [0, 1, 3],
      },
      statusCount: 0,
      maxStatusCount: 240,
    };
  },

  mounted() {
    this.initWebsocket();
  },

  computed: {
    ...mapState(['manage']),
  },

  methods: {
    handleOffline(index, row) {
      this.$confirm('您确定强制下线该账号吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          if (this.manage.id === row.id) {
            this.$tips('error', '您无法下线自己，请手动退出账号！', 'top-right', 1200);
            return;
          }
          await this.API.app.offline({ id: row.id });
          this.onlines = this.onlines.filter(el => el.id !== row.id);
        })
        .catch(() => {});
    },

    // 初始化ws
    initWebsocket() {
      this.ws = new WebSocket(`${this.CONSTANT.baseWebsocketURL}?token=${this.manage.token}`);
      this.ws.onopen = e => {
        console.log('websocket已连接...');
        this.initPoll();
      };
      this.ws.onmessage = info => {
        this.handleWebSocketMessage(info.data);
      };
    },

    handleWebSocketMessage(data) {
      try {
        data = JSON.parse(data);
        this.handleSystemStatus(data.system);
        this.handleVisitorStatus(data.visitor);
      } catch (err) {
        this.$tips('error', '实时通讯失败', 'top-right', 1200);
      }
    },

    handleSystemStatus(data) {
      if (Object.keys(data).length === 0) return;
      let { time, cpu, memory } = this.systemStatus;
      // 到达最大数量后采用队列的形式
      if (time.length > this.maxStatusCount) {
        time.shift();
        cpu.shift();
        memory.shift();
      }
      time.push(data.time);
      cpu.push(data.cpu);
      memory.push(data.memory);
      // 减少渲染次数
      this.systemStatus = {
        time,
        cpu,
        memory,
      };
    },

    handleVisitorStatus(data) {
      if (Object.keys(data).length === 0) return;
      let { time, user, admin, other } = this.visitorStatus;
      // 到达最大数量后采用队列的形式
      if (time.length > this.maxStatusCount) {
        time.shift();
        user.shift();
        admin.shift();
        other.shift();
      }
      time.push(data.time);
      user.push(data.userPV);
      admin.push(data.managePV);
      other.push(data.otherPV);
      // 减少渲染次数
      this.visitorStatus = {
        time,
        user,
        admin,
        other,
      };

      let { ipMap = {}, referers = [], hosts = [], traces = [], onlines = [] } = data;
      // 处理ip集合
      Object.keys(ipMap).map(key => {
        let exit, exitIndex;
        exit = this.uvs.some((r, index) => {
          if (r.name === key) {
            exitIndex = index;
            return r;
          }
        });
        if (!exit) {
          this.uvs.push({
            name: key,
            value: ipMap[key],
            // symbolSize: Math.floor(Math.random() * 80) + 30,
            symbolSize: ipMap[key] <= 30 ? 30 : ipMap[key],
            draggable: false,
            itemStyle: {
              normal: {
                // shadowBlur: 100,
                // shadowColor: this.TOOL.randomColor(),
                color: this.TOOL.randomColor(),
              },
            },
          });
        } else {
          let temp = { ...this.uvs[exitIndex] };
          temp.value = ipMap[key];
          this.uvs.splice(exitIndex, 1, temp);
        }
      });
      // 处理反向追踪
      referers.map(url => {
        let exit = this.referers.some(r => r.name === url);
        if (!exit) {
          this.referers.push({
            name: url,
            value: 2,
          });
        }
      });
      // 处理host
      hosts.map(host => {
        let exit = this.hosts.some(r => r.name === host);
        if (!exit) {
          this.hosts.push({
            name: host,
            value: 2,
          });
        }
      });
      // 记录关键操作
      traces.map(log => {
        let exit = this.traces.some(r => r.uid === log.uid);
        if (!exit) {
          this.traces.push({
            ...log,
          });
        }
      });
      // 处理在线用户
      this.onlines = onlines.map(el => {
        let { id, token, ttl } = el;
        if (ttl === -1) {
          ttl = '永久';
        } else if (ttl > 0) {
          ttl = (ttl / 60 / 60 / 24).toFixed(2) + '天';
        } else {
          ttl = '已失效';
        }
        return {
          id,
          token,
          ttl,
        };
      });
    },

    // 心跳
    initPoll() {
      this.timer = this.TOOL.timeout2Interval(
        () => {
          if (this.ws && this.ws.readyState === 1) {
            this.ws.send(JSON.stringify(['system', 'visitor']));
          }
        },
        1000 * 15,
        true,
      );
    },
  },

  destroyed() {
    if (this.ws) this.ws.close();
    if (this.timer) this.timer.clear();
  },
};
</script>
<style lang="scss" scoped>
.home {
  width: 100%;
  .tab-group {
    width: calc(100% - 20px);
    margin: 10px auto;
  }
}
</style>
