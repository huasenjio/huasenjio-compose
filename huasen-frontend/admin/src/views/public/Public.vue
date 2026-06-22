<!--
 * @Autor: huasenjio
 * @Date: 2021-12-17 22:03:15
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-23 17:00:04
 * @Description: 
-->
<template>
  <div class="public">
    <el-form ref="articleForm" class="article-form-group" :model="articleForm" :rules="rules" :label-position="'top'" status-icon>
      <el-form-item label="文章标题" prop="title">
        <el-input v-model="articleForm.title" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="封面链接（底部上传或粘贴链接）" prop="bannerImg">
        <el-input v-model="articleForm.bannerImg" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="发布作者" prop="manageId">
        <el-input v-model="articleForm.manageId" disabled autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="内容标签" prop="tag">
        <ul class="tag-group">
          <li v-randomColor="{ forText: true }" v-for="(item, index) in tags" :key="index">
            {{ item }}
            <i class="iconfont icon-md-close-circle" v-if="item" @click="deleteTag(index)"></i>
          </li>
        </ul>
        <el-input
          v-model="tagItem"
          autocomplete="off"
          @compositionstart.native="isTagComposing = true"
          @compositionend.native="isTagComposing = false"
          @keydown.enter.native="handleTagEnter"
          placeholder="回车添加标签"
        ></el-input>
      </el-form-item>
      <el-form-item label="访问权限" prop="code">
        <el-select class="w-full" v-model="articleForm.code" popper-class="code-select" :popper-append-to-body="false">
          <el-option v-for="item in this.CONSTANT.dictionary.code" :key="item.value" :label="item.label" :value="item.value"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="是否草稿" prop="isDraft">
        <el-select class="w-full" v-model="articleForm.isDraft" popper-class="draft-select" :popper-append-to-body="false">
          <el-option v-for="item in this.CONSTANT.dictionary.draft" :key="item.value" :label="item.label" :value="item.value"> </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <MarkdownEditor :value.sync="articleForm.content" :onImgAdd="handleImgAddUrl" @onSave="handleSave"></MarkdownEditor>
    <div class="upload-img-group">
      <el-upload
        class="upload-box"
        :style="uploadStyle"
        :headers="headers"
        :action="action"
        :on-error="uploadImgError"
        :on-success="uploadImgSuccess"
        accept=".jpg,.jpeg,.png,.svg,.gif"
        drag
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">
          <em>拖拽上传 · 点击上传</em>
          <div class="el-upload__tip" slot="tip">建议上传280*300尺寸图片且大小不超过2MB</div>
        </div>
      </el-upload>
    </div>
    <div class="submit-group">
      <div class="btn-group ml-auto">
        <span v-if="showAutoSaveStatus" class="auto-save-status" :class="`auto-save-status--${autoSaveStatus}`">{{ autoSaveStatusText }}</span>
        <el-button type="primary" @click="cancel">取消发布</el-button>
        <el-button type="danger" @click="submit">
          {{ this.articleForm._id ? '完成编辑' : '立即发布' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import MarkdownEditor from '@/components/content/markdown-editor/MarkdownEditor.vue';
import { Validator } from 'huasen-lib';
import autoSave from './article-auto-save.js';
const validator = new Validator();
const getElementFormValidator = validator.getElementFormValidator.bind(validator);
const AUTO_SAVE_DELAY = 3000;
function getDefaultArticleForm() {
  return {
    manageId: '',
    title: '',
    tag: '',
    content: '',
    bannerImg: '',
    code: 0,
    isDraft: false,
  };
}
export default {
  name: 'Public',
  components: { MarkdownEditor },
  data() {
    return {
      // 提交表单
      articleForm: getDefaultArticleForm(),
      // 校验规则
      rules: {
        title: [{ validator: getElementFormValidator(['isNonEmpty::必填项', 'minLength:2::标题长度不小于2', 'maxLength:20::标题长度不大于20']) }],
        manageId: [{ validator: getElementFormValidator(['isNonEmpty::必填项']) }],
      },

      // 标签
      tags: [],
      tagItem: '',
      isTagComposing: false,
      autoSaveReady: false,
      autoSaveTimer: null,
      autoSaveStatus: 'idle',
      hasUnsavedChanges: false,
      localDraftKey: '',
      isLeavingBySubmit: false,
    };
  },

  watch: {
    articleForm: {
      handler() {
        this.handleArticleFormChange();
      },
      deep: true,
    },
    tags: {
      handler() {
        this.syncArticleTag();
      },
      deep: true,
    },
  },

  computed: {
    ...mapState(['manage']),

    headers() {
      return {
        token: this.manage.token,
      };
    },
    action() {
      return this.TOOL.getServerApi('/file/upload');
    },
    uploadStyle() {
      return {
        '--bannerImg': `url(${this.articleForm.bannerImg})`,
      };
    },
    showAutoSaveStatus() {
      return this.autoSaveStatus !== 'idle';
    },
    autoSaveStatusText() {
      const statusMap = {
        dirty: '未保存',
        saving: '自动保存中',
        saved: '已自动保存',
        local: '已本地暂存',
        failed: '自动保存失败',
      };
      return statusMap[this.autoSaveStatus] || '';
    },
  },

  activated() {
    this.initSubmitForm();
    window.addEventListener('beforeunload', this.handleBeforeUnload);
  },

  deactivated() {
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    this.clearAutoSaveTimer();
  },

  beforeDestroy() {
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    this.clearAutoSaveTimer();
  },

  beforeRouteLeave(to, from, next) {
    if (this.isLeavingBySubmit || !this.shouldConfirmLeave()) {
      next();
      return;
    }
    const flag = window.confirm('文章存在未同步到服务端的修改，确定离开吗？');
    if (flag) {
      next();
    } else {
      next(false);
    }
  },

  methods: {
    // 初始化提交表单
    initSubmitForm() {
      this.resetAutoSaveState();
      this.$nextTick(async () => {
        let articleForm = getDefaultArticleForm();
        let tags = [];
        // 路由跳转携带参数
        if (Object.keys(this.$route.query).length !== 0) {
          let result = await this.API.article.findArticleById({ _id: this.$route.query['_id'] }, { notify: false });
          let article = result.data.pop();
          if (article) {
            articleForm = Object.assign(getDefaultArticleForm(), article);
            // 解析展示的标签
            tags = articleForm.tag ? articleForm.tag.split('/') : [];
          } else {
            this.$router.go(-1);
          }
        }
        // 默认赋值
        this.articleForm = articleForm;
        this.articleForm.manageId = this.manage.id;
        this.tags = tags;
        this.refreshLocalDraftKey();
        this.$nextTick(() => {
          this.autoSaveReady = true;
          this.restoreLocalDraft();
        });
      });
    },

    resetAutoSaveState() {
      this.autoSaveReady = false;
      this.clearAutoSaveTimer();
      this.autoSaveStatus = 'idle';
      this.hasUnsavedChanges = false;
      this.localDraftKey = '';
      this.isLeavingBySubmit = false;
    },

    handleArticleFormChange() {
      if (!this.autoSaveReady) return;
      this.hasUnsavedChanges = true;
      this.autoSaveStatus = 'dirty';
      this.scheduleAutoSave();
    },

    scheduleAutoSave() {
      this.clearAutoSaveTimer();
      this.autoSaveTimer = setTimeout(() => {
        this.runAutoSave();
      }, AUTO_SAVE_DELAY);
    },

    clearAutoSaveTimer() {
      if (this.autoSaveTimer) {
        clearTimeout(this.autoSaveTimer);
        this.autoSaveTimer = null;
      }
    },

    refreshLocalDraftKey() {
      this.localDraftKey = autoSave.buildLocalDraftKey(this.manage.id, this.articleForm._id);
    },

    getLocalDraftPayload() {
      this.syncArticleTag();
      return {
        articleForm: Object.assign({}, this.articleForm),
        tags: [].concat(this.tags),
        savedAt: Date.now(),
      };
    },

    saveLocalDraft(status) {
      this.refreshLocalDraftKey();
      this.STORAGE.setItem(this.localDraftKey, this.getLocalDraftPayload());
      this.hasUnsavedChanges = true;
      this.autoSaveStatus = status || 'local';
    },

    removeLocalDraft(key) {
      if (key) {
        this.STORAGE.removeItemByKey(key);
      }
    },

    restoreLocalDraft() {
      if (!this.localDraftKey) return;
      const draft = this.STORAGE.getItem(this.localDraftKey);
      if (!draft || !draft.articleForm) return;
      this.$confirm('检测到本地暂存的文章内容，是否恢复？', '恢复草稿', {
        confirmButtonText: '恢复',
        cancelButtonText: '忽略',
        type: 'warning',
      })
        .then(() => {
          this.autoSaveReady = false;
          this.articleForm = Object.assign(getDefaultArticleForm(), draft.articleForm);
          this.articleForm.manageId = this.manage.id;
          this.tags = Array.isArray(draft.tags) ? [].concat(draft.tags) : this.articleForm.tag ? this.articleForm.tag.split('/') : [];
          this.refreshLocalDraftKey();
          this.$nextTick(() => {
            this.autoSaveReady = true;
            this.hasUnsavedChanges = true;
            this.autoSaveStatus = 'local';
          });
        })
        .catch(() => {});
    },

    getCreatedArticle(result) {
      const data = result && result.data;
      if (Array.isArray(data)) {
        return data[0];
      }
      return data;
    },

    async runAutoSave() {
      if (!this.autoSaveReady) return;
      this.clearAutoSaveTimer();
      const previousLocalDraftKey = this.localDraftKey;
      const target = autoSave.resolveAutoSaveTarget(this.articleForm, {
        now: new Date(),
        hasArticleId: Boolean(this.articleForm._id),
      });
      if (target.target === 'local') {
        this.saveLocalDraft();
        return;
      }
      this.autoSaveStatus = 'saving';
      this.syncArticleTag();
      const payload = Object.assign({}, this.articleForm, {
        title: target.title,
      });
      if (target.forceDraft) {
        payload.isDraft = true;
      }
      try {
        let result;
        if (payload._id) {
          result = await this.API.article.updateArticle(payload, { notify: false, loading: false });
        } else {
          result = await this.API.article.addArticle(payload, { notify: false });
        }
        this.autoSaveReady = false;
        if (target.forceDraft) {
          this.articleForm.title = payload.title;
          this.articleForm.isDraft = true;
        }
        if (!this.articleForm._id) {
          const article = this.getCreatedArticle(result);
          if (article && article._id) {
            this.articleForm._id = article._id;
            this.$router.replace({ name: 'Public', query: { _id: article._id } }).catch(() => {});
          }
        }
        this.refreshLocalDraftKey();
        this.removeLocalDraft(previousLocalDraftKey);
        this.removeLocalDraft(this.localDraftKey);
        this.hasUnsavedChanges = false;
        this.autoSaveStatus = 'saved';
      } catch (err) {
        this.saveLocalDraft('failed');
      } finally {
        this.$nextTick(() => {
          this.autoSaveReady = true;
        });
      }
    },

    shouldConfirmLeave() {
      return this.hasUnsavedChanges || this.autoSaveStatus === 'local' || this.autoSaveStatus === 'failed' || this.autoSaveStatus === 'saving';
    },

    handleBeforeUnload(event) {
      if (!this.shouldConfirmLeave()) return;
      event.preventDefault();
      event.returnValue = '文章存在未同步到服务端的修改，确定离开吗？';
      return event.returnValue;
    },

    // 处理标签
    handleTagEnter(event) {
      if (this.isTagComposing || event.isComposing || event.keyCode === 229) return;
      event.preventDefault();
      this.handleTag();
    },

    handleTag() {
      if (this.isTagComposing) return;
      let tagItem = this.tagItem.trim();
      if (!tagItem) return;
      this.tags.push(tagItem);
      this.tagItem = '';
    },

    // 同步标签到提交表单
    syncArticleTag() {
      this.articleForm.tag = this.tags
        .map(item => item.trim())
        .filter(Boolean)
        .join('/');
    },

    // 点击删除标签小按钮
    deleteTag(index) {
      this.tags.splice(index, 1);
    },

    // 取消发布后跳转新闻管理
    cancel() {
      this.$router.go(-1);
    },

    // 上传图片成功回调，清空图片展示列表，然后放入最新的上传图片
    uploadImgSuccess(res) {
      if (res.code == 200) {
        let file = res.data.pop();
        this.articleForm.bannerImg = file.path;
        this.$tips('success', '上传封面成功', 'top-right');
      }
    },

    // 上传失败
    uploadImgError(err) {
      this.$tips('error', '上传封面失败', 'top-right');
    },

    // 提交新闻信息
    submit() {
      this.clearAutoSaveTimer();
      this.handleTag();
      this.syncArticleTag();
      this.$refs.articleForm.validate(valid => {
        if (valid) {
          if (this.articleForm._id) {
            // 编辑
            this.API.article.updateArticle(this.articleForm).then(res => {
              this.hasUnsavedChanges = false;
              this.isLeavingBySubmit = true;
              this.removeLocalDraft(this.localDraftKey);
              this.$router.go(-1);
            });
          } else {
            // 添加
            this.API.article.addArticle(this.articleForm).then(result => {
              this.hasUnsavedChanges = false;
              this.isLeavingBySubmit = true;
              this.removeLocalDraft(this.localDraftKey);
              this.$router.push('/article-manage');
            });
          }
        }
      });
    },

    handleSave() {},

    async handleImgAddUrl(index, file) {
      let formdata = new FormData();
      formdata.append('file', file);
      let result = await this.API.file.uploadFile(formdata, {
        url: '/file/upload?type=article',
      });
      this.$tips('success', '上传成功', 'top-right', 1200);
      // 返回url写入内容
      return location.origin + location.pathname + result.data[0].path;
    },
  },
};
</script>

<style lang="scss" scoped>
.public {
  .article-form-group {
    display: flex;
    justify-content: space-around;
    align-items: center;
    flex-wrap: wrap;
    .tag-group {
      position: absolute;
      top: -30px;
      width: 100%;
      white-space: nowrap;
      overflow-x: auto;
      overflow-y: hidden;
      li {
        display: inline-block;
        margin-left: 10px;
        font-size: 14px;
        color: var(--blue-500);
        &:first-of-type {
          margin-left: 0;
        }
        i {
          position: relative;
          left: -2px;
          color: var(--red-500);
          font-size: 12px;
          cursor: pointer;
        }
      }
    }
  }
  .upload-img-group {
    padding: 15px 10px;
    .upload-box {
      ::v-deep .el-upload {
        width: 100%;
        .el-upload-dragger {
          width: 100%;
          height: 200px;
          background-color: var(--gray-50);
          background-image: var(--bannerImg);
          background-size: cover;
          background-position: center center;
          background-repeat: no-repeat;
        }
      }
    }
  }
  .submit-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    .btn-group {
      display: flex;
      align-items: center;
      gap: 10px;
      .auto-save-status {
        font-size: 12px;
        color: var(--gray-500);
        white-space: nowrap;
      }
      .auto-save-status--dirty,
      .auto-save-status--local {
        color: var(--orange);
      }
      .auto-save-status--saving {
        color: var(--blue-500);
      }
      .auto-save-status--saved {
        color: var(--green-500);
      }
      .auto-save-status--failed {
        color: var(--red-500);
      }
    }
    .time {
      font-weight: 400;
    }
  }
}
::v-deep .el-form-item {
  position: relative;
  width: calc(50% - 20px);
  height: auto;
  .el-select-dropdown {
    position: absolute !important;
    left: 0px !important;
    border: 1px solid var(--gray-50);
  }
}
::v-deep .h-markdown-editor {
  width: calc(100% - 20px);
  margin: 0 auto;
  .markdown-editor {
    min-height: 400px;
    max-height: calc(100vh - 160px);
  }
}
</style>
