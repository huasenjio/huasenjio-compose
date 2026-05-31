<!--
 * @Autor: huasenjio
 * @Date: 2026-05-05 00:00:00
 * @LastEditors: huasenjio
 * @LastEditTime: 2026-05-05 00:00:00
 * @Description: 授权管理入口
-->

<template>
  <div class="license-manage-page">
    <el-tabs class="tab-group" v-model="activeName" @tab-click="handleTabClick">
      <el-tab-pane label="授权状态" name="license"><License ref="licenseRef"></License></el-tab-pane>
      <el-tab-pane v-if="IssueTab" label="签发授权" name="issue"><IssueTab ref="issueRef"></IssueTab></el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import License from './license/License.vue';

let IssueTab = null;

try {
  IssueTab = require('./closed-source/IssueTab.vue').default;
} catch (e) {
  /* 开源版本 */
}

export default {
  name: 'LicenseManage',
  components: {
    License,
    IssueTab: IssueTab || null,
  },
  data() {
    return {
      activeName: 'license',
      IssueTab: IssueTab,
    };
  },
  methods: {
    handleTabClick(tab) {
      const refMap = {
        license: 'licenseRef',
        issue: 'issueRef',
      };
      const refName = refMap[tab.name];
      if (refName) {
        const ref = this.$refs[refName];
        if (ref && ref.init) {
          ref.init();
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.license-manage-page {
  width: 100%;
  height: 100%;
  padding: 0 10px;

  ::v-deep .el-tabs {
    width: 100%;
    height: 100%;
    .el-tabs__item {
      font-size: 16px;
    }
    .el-tabs__content {
      width: 100%;
      height: calc(100% - 60px);
      .el-tab-pane {
        width: 100%;
        height: 100%;
      }
    }
  }
}
</style>
