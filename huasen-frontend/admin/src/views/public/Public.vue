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
      <el-form-item label="封面链接" prop="bannerImg">
        <el-input v-model="articleForm.bannerImg" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="发布作者" prop="manageId">
        <el-input v-model="articleForm.manageId" disabled autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="内容标签" prop="tag">
        <ul class="tag-group">
          <li v-for="(item, index) in tags" :key="index">
            {{ item }}
            <i class="iconfont icon-md-close-circle" v-if="item" @click="deleteTag(index)"></i>
          </li>
        </ul>
        <el-input v-model="tagItem" autocomplete="off" @keyup.enter.native="handleTag" placeholder="回车添加标签"></el-input>
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
    <MarkdownEditor :value.sync="articleForm.content"></MarkdownEditor>
    <div class="upload-img-group">
      <el-upload class="upload-box" :style="uploadStyle" :headers="headers" :action="action" :on-error="uploadImgError" :on-success="uploadImgSuccess" accept=".png" drag>
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">拖拽上传 · <em>点击上传</em></div>
      </el-upload>
    </div>
    <div class="submit-group">
      <div class="time">{{ getTime }}</div>
      <div class="btn-group">
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
import moment from 'moment';
import MarkdownEditor from './markdown-editor/MarkdownEditor.vue';

import { getElementFormValidator } from '@/plugin/strategy.js';
export default {
  name: 'Public',
  components: { MarkdownEditor },
  data() {
    return {
      // 提交表单
      articleForm: {
        manageId: '',
        title: '',
        tag: '',
        content: '',
        bannerImg: '',
        code: 0,
        isDraft: false,
        time: '',
      },
      // 校验规则
      rules: {
        title: [{ validator: getElementFormValidator(['isNoEmpty::必填项', 'minLength:2::标题长度不小于2', 'maxLength:20::标题长度不大于20']), trigger: 'blur' }],
        manageId: [{ validator: getElementFormValidator(['isNoEmpty::必填项']), trigger: 'blur' }],
      },

      // 标签
      tags: [],
      tagItem: '',
    };
  },

  watch: {
    tags: {
      handler(nV, oV) {
        let tagStr = this.tags.join('/');
        this.articleForm.tag = tagStr;
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
    getTime() {
      return moment().format('YYYY-MM-DD');
    },
    action() {
      return this.TOOL.getUploadApi('/manage/upload');
    },
    uploadStyle() {
      return {
        '--bannerImg': `url(${this.articleForm.bannerImg})`,
      };
    },
  },

  mounted() {
    this.initSubmitForm();
  },

  methods: {
    // 初始化提交表单
    initSubmitForm() {
      this.$nextTick(async () => {
        // 路由跳转携带参数
        if (Object.keys(this.$route.params).length !== 0) {
          let result = await this.API.findArticleById({ _id: this.$route.params['_id'] });
          this.articleForm = result.data.pop();
          // 解析展示的标签
          this.tags = this.articleForm.tag ? this.articleForm.tag.split('/') : [];
        }
        // 默认赋值
        this.articleForm.manageId = this.manage.id;
        this.articleForm.time = this.getTime;
      });
    },

    // 处理标签
    handleTag() {
      if (!this.tagItem) return;
      this.tags.push(this.tagItem.trim());
      this.tagItem = '';
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
      this.$refs.articleForm.validate(valid => {
        if (valid) {
          if (this.articleForm._id) {
            // 编辑
            this.API.updateArticle(this.articleForm).then(res => {
              this.$router.go(-1);
            });
          } else {
            // 添加
            this.API.addArticle(this.articleForm).then(result => {
              this.$router.push('/article-manage');
            });
          }
        }
      });
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
        font-size: 12px;
        color: var(--blue-500);
        &:first-of-type {
          margin-left: 0;
        }
        i {
          position: relative;
          left: -3px;
          color: var(--red-500);
          font-size: 10px;
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
</style>
