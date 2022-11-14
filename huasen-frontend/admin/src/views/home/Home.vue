<!--
 * @Autor: huasenjio
 * @Date: 2021-08-25 01:53:35
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-20 21:58:49
 * @Description: 仪表盘页面
-->
<template>
  <div class="home">
    <HomeStatistics></HomeStatistics>
    <HomeVisitor :visitor="visitorStatus"></HomeVisitor>
    <HomeSystem :system="systemStatus"></HomeSystem>
  </div>
</template>
<script>
import HomeStatistics from './statistics/HomeStatistics.vue';
import HomeVisitor from './visitor/HomeVisitor.vue';
import HomeSystem from './system/HomeSystem.vue';

import { mapState } from 'vuex';
export default {
  name: 'Home',

  data() {
    return {
      // 连接对象
      ws: null,
      // 定时轮询对象
      timmer: null,
      // 系统状态信息
      systemStatus: {
        time: [''],
        cpu: [],
        memory: [],
      },

      // 访问数据
      visitorStatus: {
        time: [''],
        user: [],
        admin: [],
      },
      statusCount: 0,
      maxStatusCount: 240,
    };
  },

  components: {
    HomeStatistics,
    HomeVisitor,
    HomeSystem,
  },

  mounted() {
    this.initWebsocket();
  },

  computed: {
    ...mapState(['manage']),
  },

  methods: {
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
      let { time, user, admin } = this.visitorStatus;
      // 到达最大数量后采用队列的形式
      if (time.length > this.maxStatusCount) {
        time.shift();
        user.shift();
        admin.shift();
      }
      time.push(data.time);
      user.push(data.userCount);
      admin.push(data.adminCount);
      // 减少渲染次数
      this.visitorStatus = {
        time,
        user,
        admin,
      };
    },

    // 心跳
    initPoll() {
      this.timmer = this.TOOL.timeout2Interval(
        () => {
          if (this.ws && this.ws.readyState === 1) {
            this.ws.send(JSON.stringify(['system', 'visitor']));
          }
        },
        10000,
        true,
      );
    },
  },

  destroyed() {
    if (this.ws) this.ws.close();
    if (this.timmer) this.timmer.clear();
  },
};
</script>
<style lang="scss" scoped>
.home {
  width: 100%;
}
</style>
