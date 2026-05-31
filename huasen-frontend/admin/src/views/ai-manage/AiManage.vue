<!--
 * @Autor: huasenjio
 * @Date: 2024-01-01 00:00:00
 * @LastEditors: huasenjio
 * @LastEditTime: 2026-04-28 00:00:00
-->

<template>
  <div class="ai-manage">
    <el-tabs class="tab-group" v-model="activeName" @tab-click="handleTabClick">
      <el-tab-pane label="供应商" name="provider"><Provider ref="providerRef"></Provider></el-tab-pane>
      <el-tab-pane label="模型预设" name="preset"><AiPreset ref="presetRef"></AiPreset></el-tab-pane>
      <el-tab-pane label="AI应用" name="app"><AiApp ref="appRef"></AiApp></el-tab-pane>
      <el-tab-pane label="知识包" name="knowledgePack"><KnowledgePack ref="knowledgePackRef"></KnowledgePack></el-tab-pane>
      <el-tab-pane label="对话记录" name="conversation"><Conversation ref="conversationRef"></Conversation></el-tab-pane>
      <el-tab-pane v-if="showAiPluginTabs" label="AI插件能力配置" name="ability"><Ability ref="abilityRef"></Ability></el-tab-pane>
      <el-tab-pane v-if="showPluginSourceTab" label="AI插件源码" name="pluginSource"><PluginSourceTab ref="pluginSourceRef"></PluginSourceTab></el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import Provider from './provider/Provider.vue';
import AiApp from './app/AiApp.vue';
import AiPreset from './preset/AiPreset.vue';
import KnowledgePack from './knowledge-pack/KnowledgePack.vue';
import Ability from './ability/Ability.vue';
import Conversation from './conversation/Conversation.vue';

let PluginSourceTab = null;

try {
  PluginSourceTab = require('./closed-source/PluginSourceTab.vue').default;
} catch (e) {
  /* 开源版本 */
}

export default {
  name: 'AiManage',
  data() {
    return {
      activeName: 'provider',
      PluginSourceTab: PluginSourceTab,
      licenseAuthorized: false,
    };
  },
  computed: {
    showAiPluginTabs() {
      return this.licenseAuthorized;
    },
    showPluginSourceTab() {
      return this.licenseAuthorized && !!this.PluginSourceTab;
    },
  },
  components: {
    Provider,
    AiApp,
    AiPreset,
    KnowledgePack,
    Ability,
    Conversation,
    PluginSourceTab: PluginSourceTab || null,
  },
  created() {
    this.fetchLicenseStatus();
  },
  activated() {
    this.fetchLicenseStatus();
  },
  methods: {
    fetchLicenseStatus() {
      this.API.ai
        .getLicenseStatus({}, { notify: false })
        .then(res => {
          this.licenseAuthorized = !!(res.data && res.data.authorized);
          this.ensureActiveTabVisible();
        })
        .catch(() => {
          this.licenseAuthorized = false;
          this.ensureActiveTabVisible();
        });
    },
    ensureActiveTabVisible() {
      if (!this.showAiPluginTabs && ['ability', 'pluginSource'].includes(this.activeName)) {
        this.activeName = 'provider';
      }
    },
    handleTabClick(tab) {
      const refMap = {
        provider: 'providerRef',
        app: 'appRef',
        preset: 'presetRef',
        knowledgePack: 'knowledgePackRef',
        conversation: 'conversationRef',
        ability: 'abilityRef',
        pluginSource: 'pluginSourceRef',
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
.ai-manage {
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
