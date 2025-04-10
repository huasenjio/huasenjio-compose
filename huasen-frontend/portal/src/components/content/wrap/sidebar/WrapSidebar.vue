<!--
 * @Autor: huasenjio
 * @Date: 2022-08-28 23:45:07
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-04-29 00:43:49
 * @Description: 
-->
<template>
  <div class="wrap-sidebar">
    <ul class="sidebar">
      <li v-if="showWrapSidebarSocket" class="sidebar__item shadow animate__animated animate__fadeIn">
        <i class="iconfont icon-md-rocket" @click="goTop"></i>
      </li>
      <li class="sidebar__item shadow">
        <i class="iconfont icon-a-unfoldcross-line" @click="handleNavbar"> </i>
      </li>
      <li class="sidebar__item shadow" v-for="(item, index) in displayAsidebar" :key="index" :title="item.label" @click="handleSidebar(item)">
        <el-popover placement="left" popper-class="app-wrap__asidebar__popover" :open-delay="400" :trigger="item.typeConfig.trigger === 'click' ? 'click' : 'hover'" :disabled="!(item.type === 'html')">
          <div v-if="item.type === 'html'" v-html="item.typeConfig.domStr"></div>
          <template slot="reference">
            <IconBox size="28px" :icon="item.icon"></IconBox>
          </template>
        </el-popover>
      </li>
    </ul>
  </div>
</template>
<script>
import { mapState, mapMutations } from 'vuex';
import IconBox from '@/components/common/iconBox/IconBox.vue';
import Bus from '@/plugin/event-bus.js';
import { HOME_SCROLL_TO } from '@/plugin/event-type.js';
export default {
  name: 'WrapSidebar',
  components: {
    IconBox,
  },
  data() {
    return {};
  },
  computed: {
    ...mapState(['showWrapSidebarSocket', 'asideConfig', 'appConfig', 'user']),
    displayAsidebar() {
      // 未经授权，版权声明不可移除，否则视作侵权行为，后果自负！
      // Without authorization, the copyright notice cannot be removed, otherwise it will be regarded as infringement and the consequences will be borne by you!
      if (this.appConfig.site.authorization) {
        return this.asideConfig;
      } else {
        return [
          {
            label: '版权声明',
            type: 'html',
            typeConfig: {
              domStr:
                '<div style="width:100%;max-width:480px;font-size:12px"><div style="border-bottom:1px solid #f0f0f0;padding-bottom:8px;margin-bottom:4px"><h3 style="color:#303133;font-size:16px">© 2025 花森工作室</h3><div style="color:#606266;font-size:12px">开源协议 Apache-2.0 license</div></div><div style="margin-bottom:6px"><a href="https://github.com/huasenjio/huasenjio-compose" style="color:#409eff;text-decoration:none;display:flex;align-items:center;padding:6px 0"><span style="display:inline-block;width:4px;height:16px;background:#409eff;margin-right:12px;flex-shrink:0"></span> GitHub：https://github.com/huasenjio/huasenjio-compose </a><a href="https://gitee.com/HuaSenJioJio/huasenjio-compose" style="color:#e6a23c;text-decoration:none;display:flex;align-items:center;padding:6px 0"><span style="display:inline-block;width:4px;height:16px;background:#e6a23c;margin-right:12px;flex-shrink:0"></span> Gitee：https://gitee.com/HuaSenJioJio/huasenjio-compose</a></div><div style="background:#fef1f0;border-left:2px solid #f56c6c;padding:8px 12px;border-radius:2px"><p style="color:#f56c6c;font-size:12px;line-height:1.5;margin:0">未经授权，卡片不可移除，否则视作侵权行为，后果自负！<br>Without authorization, The card cannot be removed, otherwise it will be regarded as infringement and the consequences will be borne by you!</p></div></div>',
            },
            icon: 'iconfont icon-github',
          },
          ...this.asideConfig,
        ];
      }
    },
  },
  methods: {
    ...mapMutations(['commitAll']),

    handleNavbar() {
      this.commitAll({
        user: {
          config: {
            showNavbar: !this.user.config.showNavbar,
          },
        },
      });
      this.$store.dispatch('snapshoot');
    },

    handleSidebar(item) {
      let articleId;
      switch (item.type) {
        case 'link':
          this.TOOL.openPage(this.LODASH.get(item, 'typeConfig.url'), this.LODASH.get(item, 'typeConfig.target'));
          break;
        case 'article':
          articleId = this.LODASH.get(item, 'typeConfig.articleId');
          if (!articleId) return;
          this.TOOL.jumpToRead(this, articleId);
          break;
      }
    },

    // 回到顶部
    goTop() {
      Bus.pubEv(HOME_SCROLL_TO, 0, true);
    },
  },
};
</script>

<style lang="scss" scoped>
.wrap-sidebar {
  position: absolute;
  right: 0px;
  bottom: 50px;
  z-index: 1;
  ul {
    li {
      width: 40px;
      height: 40px;
      margin: 10px 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 50%;
      background-color: var(--gray-0);
      i {
        font-size: 24px;
        font-weight: bold;
      }
    }
  }
}
</style>
<style lang="scss">
.app-wrap__asidebar__popover {
  max-width: calc(100vw - 100px);
  min-width: auto !important;
  width: fit-content !important;
  height: fit-content !important;
}
</style>
