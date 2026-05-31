/*
 * @Autor: huasenjio
 * @Date: 2026-04-28 00:00:00
 * @LastEditors: huasenjio
 * @LastEditTime: 2026-05-01 00:00:00
 * @Description: AI 插件状态 Mixin，用于宿主页面引入 AI 插件加载能力：dev-直接引用本地 closed-source/AiPlugin.vue；prod-从服务端获取 SFC 源码
 */
import { isLicenseSyncableFailureReason } from 'huasen-lib';
import { createPluginComponent } from '../ai-plugin/sfc-loader';

const AI_PLUGIN_STATUS_CACHE_TIME = 3000;

function getResponseMessage(payload, fallback) {
  return (payload && (payload.message || payload.msg)) || fallback || '';
}

// dev 模式下直接静态引用本地文件
var devPluginComponent = null;
if (process.env.NODE_ENV === 'development') {
  try {
    devPluginComponent = require('../../../closed-source/AiPlugin.vue').default;
  } catch (e) {
    /* 开源版本不包含闭源文件 */
  }
}

export default {
  data() {
    return {
      aiPluginAuthorized: false,
      aiPluginComponent: null,
      aiPluginAbilities: [],
      aiPluginSyncTipShown: false,
      aiPluginStatusData: null,
      aiPluginStatusFetchedAt: 0,
      aiPluginStatusPromise: null,
    };
  },
  // async created() {
  //   await this.loadAiPlugin();
  // },
  async activated() {
    await this.loadAiPlugin();
  },
  methods: {
    async loadAiPlugin() {
      // dev: 本地引用（支持 HMR）
      if (process.env.NODE_ENV === 'development' && devPluginComponent) {
        this.aiPluginComponent = devPluginComponent;
        this.aiPluginAuthorized = true;
        await this.refreshAiPluginAbilities();
        return;
      }

      // prod: 从服务端动态加载 SFC。授权同步后，keep-alive 页面重新激活时也需要刷新状态。
      try {
        var statusData = await this.fetchAiPluginStatus({ loading: true, force: true });
        if (statusData && statusData.authorized && statusData.source) {
          if (!this.aiPluginComponent) {
            var component = await createPluginComponent(statusData.source, statusData.version);
            if (component) {
              this.aiPluginComponent = component;
            }
          }
          this.aiPluginAuthorized = !!this.aiPluginComponent;
          this.aiPluginAbilities = statusData.abilities || [];
          return;
        }
        if (statusData && isLicenseSyncableFailureReason(statusData.reason) && !this.aiPluginSyncTipShown) {
          this.aiPluginSyncTipShown = true;
          this.showAiPluginMessage('warning', getResponseMessage(statusData, '授权状态已变化，请前往授权管理同步状态'));
        }
        this.aiPluginAuthorized = false;
      } catch (err) {
        this.aiPluginAuthorized = false;
        this.showAiPluginMessage('error', this.getAiPluginErrorMessage(err, 'AI 插件加载失败'));
        console.warn('AI 插件加载失败:', err);
      }
    },
    async fetchAiPluginStatus(options = {}) {
      var force = options.force === true;
      var cached = this.aiPluginStatusData && Date.now() - this.aiPluginStatusFetchedAt < AI_PLUGIN_STATUS_CACHE_TIME;
      if (!force && cached) {
        return this.aiPluginStatusData;
      }
      if (this.aiPluginStatusPromise) {
        return this.aiPluginStatusPromise;
      }

      this.aiPluginStatusPromise = this.API.ai
        .pluginStatus(
          {},
          {
            notify: false,
            errorNotify: false,
            loading: options.loading === true,
          },
        )
        .then(res => {
          this.aiPluginStatusData = (res && res.data) || null;
          this.aiPluginStatusFetchedAt = Date.now();
          return this.aiPluginStatusData;
        })
        .finally(() => {
          this.aiPluginStatusPromise = null;
        });

      return this.aiPluginStatusPromise;
    },
    async refreshAiPluginAbilities(options = {}) {
      try {
        var statusData = await this.fetchAiPluginStatus({ force: options.force === true, loading: false });
        if (statusData && Array.isArray(statusData.abilities) && statusData.abilities.length > 0) {
          this.aiPluginAbilities = statusData.abilities || [];
        }
      } catch (err) {
        if (options.silent === false) {
          this.showAiPluginMessage('error', this.getAiPluginErrorMessage(err, 'AI 插件能力加载失败'));
        }
      }
    },
    getAiPluginErrorMessage(err, fallback) {
      var responseData = err && err.response && err.response.data;
      return getResponseMessage(responseData, err && err.message ? err.message : fallback);
    },
    showAiPluginMessage(type, message) {
      if (!message) return;
      if (this.$message && this.$message[type]) {
        this.$message[type](message);
      } else if (this.$tips) {
        this.$tips(type, message, 'top-right', 2000);
      }
    },
  },
};
