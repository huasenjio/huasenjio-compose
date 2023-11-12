<!--
 * @Autor: huasenjio
 * @Date: 2022-09-30 21:51:09
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-27 00:10:17
 * @Description: 右侧内容区
-->
<template>
  <div class="wrap-right" :class="{ full: !showWrapLeft }">
    <header>
      <div class="left">
        <i title="折叠" class="iconfont icon-a-unfoldcross-line tool" @click="hiddenWrapLeft"></i>
        <!-- <i title="系统配置" class="iconfont icon-xitongpeizhi tool" @click="openSetPanel"></i> -->
        <i title="JSON编辑器" class="iconfont icon-json tool" @click="openJsonToolPanel"></i>
        <i title="动态代码执行器" class="iconfont icon-daima tool" @click="openRumtimePanel"></i>
      </div>
      <div class="right" title="退出登录">
        <i class="iconfont icon-exit-line relative left-px-2" @click="exit"></i>
      </div>
    </header>
    <main>
      <div class="title">
        <div class="tab-group" id="js-tab-group">
          <div class="tab" :class="{ active: currentTabKey === item.path }" v-for="item in this.displayTabs" :key="item.path" @click="clickTab(item)">
            <div :title="item.title" class="tab-label text">
              {{ item.title }}
            </div>
            <i title="刷新" v-if="currentTabKey === item.path" class="tab-icon el-icon-refresh" @click.stop="refreshTab(item.componentName)"></i>
            <i title="关闭页面" class="tab-icon el-icon-close" @click.stop="removeTab(item.path)"></i>
          </div>
        </div>
        <div v-if="showPaging" class="icon-group w-px-36 flex items-center ml-auto">
          <i :style="{ opacity: this.canPre ? 1 : 0.5 }" class="el-icon-d-arrow-left" @click="handlePre"></i>
          <i :style="{ opacity: this.canNext ? 1 : 0.5 }" class="el-icon-d-arrow-right" @click="handleNext"></i>
        </div>
      </div>
      <div class="router-body">
        <keep-alive :max="10" :include="caches">
          <router-view v-if="isRenderTab"></router-view>
        </keep-alive>
      </div>
      <div class="footer text">{{ (site.name || '花森').split('').join(' ') }} 后 台 管 理 由 腾 讯 云 强 力 驱 动 · 2021 年 2 月 3 日</div>
    </main>
    <RuntimePanel v-if="showRumtime" :visible.sync="showRumtime"></RuntimePanel>
    <SetPanel v-if="showSet" :visible.sync="showSet"></SetPanel>
    <JsonToolPanel v-if="showJsonEdit" :visible.sync="showJsonEdit"></JsonToolPanel>
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex';

import RuntimePanel from './RuntimePanel.vue';
import SetPanel from './SetPanel.vue';
import JsonToolPanel from './JsonToolPanel.vue';

export default {
  name: 'WrapRight',

  components: { RuntimePanel, SetPanel, JsonToolPanel },

  data() {
    return {
      showRumtime: false,
      showSet: false,
      showJsonEdit: false,

      tabs: [],
      currentTabKey: '',
      isRenderTab: true,

      pageNo: 1,
      pageSize: 0,
    };
  },

  computed: {
    ...mapState(['site', 'showWrapLeft', 'caches']),

    canPre() {
      return this.pageNo <= 1 ? false : true;
    },

    canNext() {
      return this.tabs.length - this.pageNo * this.pageSize > 0 ? true : false;
    },

    showPaging() {
      return this.tabs.length > this.pageSize ? true : false;
    },

    displayTabs() {
      let startIndex = (this.pageNo - 1) * this.pageSize;
      let endIndex = this.pageNo * this.pageSize;
      return this.tabs.slice(startIndex, endIndex);
    },
  },

  watch: {
    '$route.path': {
      handler() {
        this.collectCaches();
        this.changeCurrentTab();
      },
      immediate: true,
    },

    tabs: {
      handler() {
        this.initTabPaging();
      },
      deep: true,
      immediate: true,
    },
  },

  methods: {
    ...mapActions(['addCache', 'removeCache', 'removeCacheEntry']),

    handlePre() {
      if (!this.canPre) return;
      this.pageNo--;
    },

    handleNext() {
      if (!this.canNext) return;
      this.pageNo++;
    },

    // 根据容器的大小，计算页长
    initTabPaging() {
      let node = document.getElementById('js-tab-group');
      if (node) {
        let totalWidth = node.getBoundingClientRect().width;
        let count = totalWidth / 100;
        if (Number.isInteger(count)) {
          // 整除
          this.pageSize = count;
        } else {
          // 向下取整
          this.pageSize = Math.floor(count);
        }
      }
    },

    // 收集需要缓存的页面
    collectCaches() {
      // 收集当前路由相关的缓存
      this.$route.matched.forEach(routeMatch => {
        const componentName = routeMatch.components?.default?.name;
        // 配置了meta.keepAlive的路由组件添加到缓存
        if (routeMatch.meta.keepAlive) {
          this.addCache(componentName);
        } else {
          this.removeCache(componentName);
        }
      });
    },

    // 切换tab
    changeCurrentTab() {
      const { path, query, params, hash, matched } = this.$route;
      // 排除默认路由
      if (path === '/') {
        return;
      }
      let existIndex;

      this.currentTabKey = path;
      const routeMatch = this.LODASH.get(matched, '[0]');
      const meta = this.LODASH.get(routeMatch, 'meta');
      const keepAlive = this.LODASH.get(meta, 'keepAlive');
      const title = this.LODASH.get(meta, 'title');
      const componentName = routeMatch.components?.default?.name;
      const tab = this.tabs.find((tab, index) => {
        if (tab.path === path) {
          existIndex = index;
          return true;
        }
      });

      // 构建新tab信息
      const newTab = {
        title,
        path,
        params,
        query,
        hash,
        keepAlive,
        componentName,
      };

      if (tab) {
        // 存在的标签处于的页码
        let pageNo = (existIndex + 1) / this.pageSize;
        if (Number.isInteger(pageNo)) {
          // 整除
          this.pageNo = pageNo;
        } else {
          // 向上取整
          this.pageNo = Math.ceil(pageNo);
        }

        // 比较路由参数是否变化，如果发生更改，就替换实例
        if (
          JSON.stringify({
            query: tab.query,
            params: tab.params,
            hash: tab.hash,
          }) !==
          JSON.stringify({
            query: query,
            params: params,
            hash: hash,
          })
        ) {
          this.tabs.splice(existIndex, 1, newTab);
          this.refreshTab(tab.componentName);
        }
      } else {
        this.tabs.unshift(newTab);
        this.pageNo = 1;
      }
    },

    // 添加标签页
    clickTab(tab) {
      if (tab.path !== this.$route.path) {
        this.goTab(tab);
      }
    },

    goTab(tab) {
      // path方式只能携带query的参数
      // name方式query和params的参数都能携带
      this.$router.push({
        name: tab.componentName,
        query: tab.query,
        params: tab.params,
        hash: tab.hash,
      });
    },

    // 删除标签页
    removeTab(path) {
      if (this.tabs.length === 1) return;
      const index = this.tabs.findIndex(tab => tab.path === path);
      if (index <= -1) return;

      // 记录删除组件的前后tab
      const preTab = this.tabs[index - 1];
      const nextTab = this.tabs[index + 1];
      const removeTab = this.tabs[index];

      // 删除tab
      this.tabs.splice(index, 1);
      // 不是第一页的情况下，若删除之后没有展示的标签，则后退一页
      if (this.pageNo > 1 && this.displayTabs.length === 0) {
        this.pageNo--;
      }

      // 删除当前所在路由页面，没有下一个，就取前一个
      if (this.currentTabKey === path) {
        if (nextTab) {
          this.goTab(nextTab);
        } else if (preTab) {
          this.goTab(preTab);
        }
      }
      this.removeCache(removeTab.componentName);
    },

    // 刷新当前tab页面
    refreshTab(name) {
      this.isRenderTab = false;
      const index = this.caches.indexOf(name);
      if (index > -1) {
        // 清除缓存
        this.caches.splice(index, 1);
      }
      this.$nextTick(() => {
        this.caches.push(name); // 重新添加缓存
        this.isRenderTab = true;
      });
    },

    hiddenWrapLeft() {
      this.$store.commit('commitAll', {
        showWrapLeft: !this.showWrapLeft,
      });
    },

    exit() {
      this.$confirm('下线登录账号，清理身份数据，即将安全退出。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          // 清理本地数据
          this.STORAGE.clear();
          // 刷新页面
          location.reload();
        })
        .catch(() => {});
    },

    openRumtimePanel() {
      this.showRumtime = true;
    },

    openSetPanel() {
      this.showSet = true;
    },

    openJsonToolPanel() {
      this.showJsonEdit = true;
    },
  },
};
</script>

<style lang="scss"></style>

<style lang="scss" scoped>
.wrap-right {
  width: calc(100% - 200px);
  height: 100%;
  header {
    width: 100%;
    height: 60px;
    padding: 0 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .left {
      width: calc(100% - 28px);
      overflow-x: auto;
      overflow-y: hidden;
      .tool {
        margin-left: 18px;
        &:first-child {
          margin-left: 0px;
        }
      }
    }
    .right {
      margin-left: auto;
    }
    i {
      font-size: 28px;
      font-weight: 500;
      color: var(--gray-600);
      cursor: pointer;
    }
  }
  main {
    width: 100%;
    height: calc(100% - 60px);
    padding: 0 15px;
    background-color: var(--gray-100);
    .title {
      width: 100%;
      height: 50px;
      padding: 0 10px;
      display: flex;
      align-items: center;
      font-size: 18px;
      color: var(--gray-0);
      background-color: var(--indigo-400);
      box-sizing: border-box;
    }
    .router-body {
      width: 100%;
      height: calc(100% - 80px);
      overflow-x: hidden;
      overflow-y: auto;
      background-color: var(--gray-0);
    }
    .footer {
      width: 100%;
      height: 30px;
      padding: 0 10px;
      line-height: 30px;
      background-color: var(--gray-0);
    }
    .tab-group {
      display: flex;
      align-items: center;
      padding: 4px 0;
      overflow-x: auto;
      overflow-y: hidden;
      width: calc(100% - 36px);
      .tab {
        width: 100px;
        height: 32px;
        display: flex;
        align-items: center;
        margin-left: 6px;
        padding: 0px 6px;
        border-radius: 2px;
        font-size: 14px;
        color: var(--gray-600);
        background-color: var(--gray-50);
        opacity: 0.4;
        transition: opacity 0.3s ease;
        cursor: pointer;
        .tab-label {
          margin-right: auto;
        }
        .tab-icon {
          font-size: 14px;
          &:hover {
            color: var(--blue-400);
          }
        }
        &:first-child {
          margin-left: 0;
        }
        &:hover {
          opacity: 0.95;
        }
      }
      .active {
        opacity: 0.95;
      }
    }
  }
}
.full {
  width: 100%;
}
</style>
