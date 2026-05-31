<!--
 * @Autor: huasenjio
 * @Date: 2022-02-05 11:45:47
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-20 20:38:09
 * @Description: 
-->
<template>
  <div class="site-manage">
    <el-tabs class="tab-group" v-model="activeName" @tab-click="handleTabClick">
      <el-tab-pane label="网站列表" name="site"><Site ref="siteRef"></Site></el-tab-pane>
      <el-tab-pane label="标签列表" name="tag"><Tag ref="tagRef"></Tag></el-tab-pane>
      <el-tab-pane label="标记列表" name="pin"><Pin ref="pinRef"></Pin></el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import Site from './site/Site.vue';
import Pin from './pin/Pin.vue';
import Tag from './tag/Tag.vue';

export default {
  name: 'SiteManage',
  data() {
    return {
      activeName: 'site', // site || tag || pin
    };
  },
  components: {
    Site,
    Pin,
    Tag,
  },
  mounted() {},
  methods: {
    handleTabClick(tab) {
      const refs = this.$refs || {};
      // 点击当前已激活的标签页时刷新数据
      if (tab.name === this.activeName) {
        if (tab.name === 'site' && refs.siteRef) {
          refs.siteRef.init();
        } else if (tab.name === 'tag' && refs.tagRef) {
          refs.tagRef.init();
        } else if (tab.name === 'pin' && refs.pinRef) {
          refs.pinRef.init();
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.site-manage {
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
