<template>
  <HsDialog class="recovery-dialog" :title="'数据管理面板'" :width="width" :height="height" :close-on-click-modal="false" v-bind="$attrs" v-on="$listeners">
    <el-tabs class="recovery-dialog__tabs" type="border-card" v-model="active">
      <el-tab-pane name="backup" label="数据备份">
        <el-button icon="el-icon-document-copy" type="info" size="mini" @click="handleCopy">拷贝数据</el-button>
        <el-button icon="el-icon-upload" type="success" size="mini" @click="handleSaveToCloud">数据上云</el-button>
      </el-tab-pane>
      <el-tab-pane name="recovery" label="恢复数据">
        <el-button icon="el-icon-document-copy" type="info" size="mini" @click="handleRecoveryByPaste">粘贴数据恢复</el-button>
        <el-button icon="el-icon-download" type="success" size="mini" @click="handleRecoveryByCloud">应用云端数据</el-button>
      </el-tab-pane>
      <div class="tabs__textarea w-full h-px-320 mt-px-20">
        <el-input :disabled="active === 'backup'" type="textarea" placeholder="请粘贴离线数据" v-model="displayData" :autosize="{ minRows: 14, maxRows: 14 }" resize="none"></el-input>
      </div>
    </el-tabs>
  </HsDialog>
</template>
<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
import HsDialog from '@/components/content/dialog/Dialog.vue';
export default {
  name: 'RecoveryDialog',
  components: {
    HsDialog,
  },
  data() {
    return {
      width: 435,
      height: 500,
      // 展示卡片名称
      active: 'backup',
      // 当前本地存储的数据
      currentData: '',
      // 输入框中展示的数据
      displayData: '',
    };
  },

  mounted() {
    this.handleBackupData();
  },

  computed: {
    ...mapState(['user']),
    ...mapGetters(['isLogin']),
  },

  watch: {
    active: {
      handler(nV) {
        this.displayData = nV === 'backup' ? this.currentData : '';
      },
    },
  },

  methods: {
    ...mapMutations(['commitAll']),

    /**
     * 提交数据
     */
    handleCommit(data) {
      if (Object.keys(data).length === 0) return;
      this.commitAll(data);
      this.$store.dispatch('snapshoot');
    },

    /**
     * 处理本地数据
     */
    handleBackupData() {
      let { records, config } = this.user;
      // 备份的数据
      let data = {
        records,
        config,
      };
      this.currentData = JSON.stringify(data);
      this.displayData = this.currentData;
    },

    /**
     * 复制数据
     */
    handleCopy() {
      this.TOOL.copyTextToClip(this.displayData, '数据已复制到剪贴板');
    },

    /**
     * 保存数据到云端
     */
    handleSaveToCloud() {
      if (this.isLogin) {
        // 已登录
        this.$store.dispatch('initLocalUserInfo');
        setTimeout(() => {
          let { config, records } = this.STORAGE.getItem(this.CONSTANT.localUser);
          let params = {
            config,
            records,
          };
          this.API.backup(params, {
            secret: true,
          });
        }, 200);
      } else {
        this.$tips('error', '请先登录账号');
      }
    },

    /**
     * 粘贴方式恢复数据
     */
    async handleRecoveryByPaste() {
      try {
        // let rawData;
        // if (window.isSecureContext && navigator.clipboard) {
        //   // https、localhost、127.0.0.1状态下可用
        //   rawData = await navigator.clipboard.readText();
        // }

        let data = JSON.parse(this.displayData);
        let { records, config } = data;
        // 排除移除低级格式异常
        if (!Array.isArray(records || Object.prototype.toString.call(config) !== '[object Object]')) {
          throw new Error();
        }
        // 存储至仓库
        this.handleCommit({
          user: {
            records,
            config,
          },
        });
        this.$tips('success', '恢复成功，即将刷新页面！', 'top-right', 2000, () => {
          window.location.reload();
        });
      } catch (err) {
        this.$tips('error', '恢复失败，请检查数据格式！', 'top-right', 2000);
      }
    },

    /**
     * 从云端恢复数据
     */
    handleRecoveryByCloud() {
      if (this.isLogin) {
        // 已登录
        this.API.recovery(
          {},
          {
            notify: false,
          },
        ).then(result => {
          let { records, config } = result.data;
          let user = this.STORAGE.getItem(this.CONSTANT.localUser);
          user.records = records;
          user.config = config;
          this.STORAGE.setItem(this.CONSTANT.localUser, user);
          this.$tips('success', '应用云端数据成功，即将刷新页面！', 'top-right', 2000, () => {
            window.location.reload();
          });
        });
      } else {
        this.$tips('error', '请先登录账号');
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.recovery-dialog {
  .recovery-dialog__tabs {
    .tabs__textarea {
      ::v-deep .el-textarea__inner {
        padding: 10px;
        border-radius: 2px;
      }
    }
  }
}
</style>
