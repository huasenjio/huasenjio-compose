<template>
  <HsDialog class="recovery-dialog" :title="'数据管理面板'" :width="width" :height="height" :maxHeight="height" :close-on-click-modal="false" v-bind="$attrs" v-on="$listeners">
    <el-tabs class="recovery-dialog__tabs" type="border-card" v-model="active">
      <el-tab-pane name="backup" label="数据备份">
        <el-button icon="el-icon-document-copy" type="info" size="mini" @click="handleCopy">拷贝离线数据</el-button>
        <el-button icon="el-icon-upload" type="success" size="mini" @click="handleSaveToCloud">离线数据上云</el-button>
      </el-tab-pane>
      <el-tab-pane name="recovery" label="恢复数据">
        <el-button icon="el-icon-brush" type="info" size="mini" @click="handleRecoveryByPaste">离线数据恢复</el-button>
        <el-button icon="el-icon-download" type="success" size="mini" @click="handleRecoveryByCloud">应用云端数据</el-button>
      </el-tab-pane>
      <el-tab-pane name="bookmark" label="浏览器书签导入">
        <el-button v-if="bookmarkData" type="primary" icon="el-icon-finished" size="mini" @click="handleBookmarkImport">确定导入</el-button>
        <el-upload v-else ref="bookmarkUpload" action="" :auto-upload="false" :on-change="handleBookmarkUpload" accept=".html" :show-file-list="false">
          <el-button icon="el-icon-discover" type="primary" size="mini">选择书签文件</el-button>
          <div slot="tip" class="el-upload__tip">仅支持浏览器导出的.html格式的书签文件</div>
        </el-upload>
      </el-tab-pane>
      <div class="tabs__textarea w-full h-px-320 mt-px-20">
        <el-input v-if="active === 'bookmark'" v-model="bookmarkData" :disabled="!!!bookmarkData" :autosize="{ minRows: 14, maxRows: 14 }" resize="none" type="textarea"></el-input>
        <el-input
          v-if="['backup', 'recovery'].includes(active)"
          v-model="displayData"
          :disabled="active === 'backup'"
          :autosize="{ minRows: 14, maxRows: 14 }"
          type="textarea"
          placeholder="请粘贴离线数据"
          resize="none"
        ></el-input>
      </div>
    </el-tabs>
  </HsDialog>
</template>
<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
import { tool } from 'huasen-lib';
import HsDialog from '@/components/content/dialog/Dialog.vue';
export default {
  name: 'RecoveryDialog',
  components: {
    HsDialog,
  },
  data() {
    return {
      width: 435,
      height: 510,
      // 展示卡片名称
      active: 'backup',
      // 当前本地存储的数据
      currentData: '',
      // 输入框中展示的数据
      displayData: '',
      // 浏览器书签数据
      bookmarkData: '',
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
    handleCommit(data, paths) {
      this.commitAll(data);
      this.$store.dispatch('snapshoot', { paths });
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
      this.currentData = JSON.stringify(data, null, 2);
      this.displayData = this.currentData;
    },

    /**
     * 复制数据
     */
    handleCopy() {
      tool.copyTextToClip(this.displayData, () => {
        alert('本地数据已复制到剪贴板');
      });
    },

    /**
     * 保存数据到云端
     */
    handleSaveToCloud() {
      if (this.isLogin) {
        // 本地数据回显，避免备份和效果不一致
        this.$store.dispatch('initLocalUserInfo');
        this.$store.dispatch('snapshoot', { paths: ['records', 'config'] });
        setTimeout(() => {
          let { config, records } = this.STORAGE.getItem(this.CONSTANT.localUser);
          config = JSON.stringify(tool.parseJSON(config, 'Object', {}));
          records = JSON.stringify(tool.parseJSON(records, 'Array', []));
          let params = {
            config,
            records,
          };
          this.API.User.backup(params, {
            secret: 'aesinrsa',
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
        let data = JSON.parse(this.displayData);
        let { records, config } = data;
        // 排除移除低级格式异常
        if (!Array.isArray(records || Object.prototype.toString.call(config) !== '[object Object]')) {
          throw new Error();
        }
        // 存储至仓库
        this.handleCommit(
          {
            user: {
              records,
              config,
            },
          },
          ['records', 'config'],
        );
        this.$tips('success', '即将刷新页面', 'top-right', 2000, () => {
          window.location.reload();
        });
      } catch (err) {
        this.$tips('error', '请检查离线数据格式', 'top-right', 2000);
      }
    },

    handleBookmarkImport() {
      try {
        let data = tool.parseJSON(this.bookmarkData, 'Array', []);
        if (!data.length) {
          throw new Error();
        }
        let { records } = this.user;
        records = records.concat(data);
        this.handleCommit(
          {
            user: {
              records,
            },
          },
          ['records'],
        );
        this.$tips('success', '书签数据导入成功', 'top-right', 2000, () => {
          this.bookmarkData = '';
          this.$refs.bookmarkUpload.clearFiles();
        });
      } catch (err) {
        this.$tips('error', '请检查导入数据格式', 'top-right', 2000);
      }
    },

    handleBookmarkUpload(file) {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const bookmarks = this.parseBookmarks(e.target.result);
          const addBookmarks = bookmarks.map(item => ({
            id: tool.getUid(16, 8),
            name: item.name,
            url: item.url,
            remarks: '',
          }));
          this.bookmarkData = JSON.stringify(addBookmarks, null, 2);
          this.$tips('success', '书签文件解析成功', 'top-right', 2000);
        } catch (err) {
          this.$refs.bookmarkUpload.clearFiles();
          this.$tips('error', '书签文件解析失败', 'top-right', 2000);
        }
      };
      reader.onerror = () => {
        this.$refs.bookmarkUpload.clearFiles();
      };
      reader.readAsText(file.raw);
    },

    parseBookmarks(data) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(data, 'text/html');
      const aElements = doc.querySelectorAll('a');
      const bookmarks = Array.from(aElements).map(a => ({
        name: a.textContent,
        url: a.href,
      }));
      return bookmarks;
    },

    /**
     * 从云端恢复数据
     */
    handleRecoveryByCloud() {
      if (this.isLogin) {
        // 已登录
        this.API.User.recovery(
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
