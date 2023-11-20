<!--
 * @Autor: huasenjio
 * @Date: 2022-09-12 10:40:59
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-05-28 13:25:13
 * @Description: 全局表单处理弹框
-->

<template>
  <div>
    <HsDialog class="dialog-form" v-bind="$attrs" v-on="$listeners" :title="title" @comfirmDialog="comfirmDialog" @closeDialog="closeDialog" @close="close">
      <el-form ref="form" class="form-group" :model="formData" :rules="formRule" label-position="top">
        <el-form-item v-for="(formTtem, index) in formMap" :key="index" :label="formTtem.label" :prop="formTtem.key">
          <!-- 输入框 -->
          <el-input v-if="formTtem.type === 'input'" :disabled="handleDisabled(formTtem)" v-model="formData[formTtem.key]"></el-input>
          <!-- 选择框 -->
          <el-select
            v-if="formTtem.type === 'select'"
            v-model="formData[formTtem.key]"
            :allow-create="getSelectByAttr('selectConfig.allow-create', formTtem)"
            :filterable="getSelectByAttr('selectConfig.filterable', formTtem)"
            :multiple="getSelectByAttr('selectConfig.multiple', formTtem)"
            :multiple-limit="getSelectByAttr('selectConfig.multiple-limit', formTtem, 8)"
            :popper-append-to-body="false"
          >
            <el-option v-for="(option, i) in formTtem.selectOptions" :key="i" :label="option.label" :value="option.value"> </el-option>
          </el-select>
          <!-- 开关 -->
          <el-switch v-if="formTtem.type === 'switch'" v-model="formData[formTtem.key]"></el-switch>
          <!-- 文本域 -->
          <el-input v-if="formTtem.type === 'textarea'" :autosize="{ minRows: 4 }" type="textarea" v-model="formData[formTtem.key]"></el-input>
          <!-- 图标项 -->
          <div class="icon-group" v-if="formTtem.type === 'icon'">
            <el-tabs v-model="activeName" type="border-card" @tab-click="handleTabClick">
              <el-tab-pane label="文字图标" name="text">
                <IconColorSelect :color.sync="iconColor"></IconColorSelect>
                <div>图标文字</div>
                <el-input placeholder="请输入文字" prefix-icon="el-icon-edit" v-model="iconText"> </el-input>
                <div>图标效果</div>
                <div class="result-view-container"><IconResultContainer id="icon-text-target-container" :isTextMode="true" :color.sync="iconColor" :text="iconText"></IconResultContainer></div>
              </el-tab-pane>
              <el-tab-pane label="上传图标" name="upload">
                <div>已选图标</div>
                <el-upload
                  :headers="headers"
                  :style="getUploadedStyle(formTtem.type)"
                  :action="getUploadAction(formTtem.type)"
                  :on-error="handleError"
                  :on-success="(respose, file, fileList) => handleSuccess(respose, file, fileList, formTtem.type)"
                  :show-file-list="false"
                  list-type="picture-card"
                >
                  <i class="el-icon-plus"></i>
                </el-upload>
              </el-tab-pane>
              <el-tab-pane v-if="showFindFaviconTab" label="推荐图标" name="query">
                <IconColorSelect :color.sync="iconImgModeColor"></IconColorSelect>
                <div>推荐图标</div>
                <ul class="favicon-group">
                  <li class="rounded" :class="{ select: selectFaviconIndex === index }" v-for="(item, index) in favicons" :key="index" @click="selectFavicon(index)">
                    <img class="w-full h-full" v-lazy="{ unload: require('@/assets/img/error/image-error.png') }" :id="index" :src="item" alt="image" />
                  </li>
                </ul>
                <div>图标效果</div>
                <div v-if="faviconIconURL" class="result-view-container">
                  <IconResultContainer id="icon-img-target-container" :isTextMode="false" :color.sync="iconImgModeColor" :url="faviconIconURL"></IconResultContainer>
                </div>
              </el-tab-pane>
              <el-input class="mt-px-10" placeholder="图标地址" :disabled="!showUpload" v-model="formData[formTtem.key]">
                <el-button class="create" title="生成图标" slot="append" :icon="showUpload ? 'el-icon-files' : 'el-icon-document-add'" @click="handleCreateIconUrl"></el-button>
              </el-input>
            </el-tabs>
          </div>
          <!-- 封面 -->
          <div v-if="formTtem.type === 'banner'">
            <el-upload
              :headers="headers"
              :style="getUploadedStyle(formTtem.type)"
              :action="getUploadAction(formTtem.type)"
              :on-error="handleError"
              :on-success="(respose, file, fileList) => handleSuccess(respose, file, fileList, formTtem.type)"
              :show-file-list="false"
              list-type="picture-card"
            >
              <i class="el-icon-plus"></i>
            </el-upload>
            <el-input class="mt-px-10" v-model="formData[formTtem.key]"></el-input>
          </div>
        </el-form-item>
      </el-form>
    </HsDialog>
    <!-- 图标库 -->
    <HsDialog title="图标库" :fullscreen="true" :visible="showLab" :buttons="{ cancel: '关 闭' }" @closeDialog="closeLab" @close="closeLab">
      <el-row :gutter="20">
        <el-col :span="2" class="lab-icon-group" :class="{ 'select-active': formData.icon === url }" v-for="(url, index) in icons" :key="`${url}-${index}`">
          <div :title="url" class="icon-item">
            <img v-lazy :src="url" :alt="url" />
            <i @click="handleSelectIcon(url)" title="选择" class="select-btn el-icon-success"></i>
            <el-popconfirm @confirm="handleRemoveIcon(url)" class="mr-px-10" popper-class="delete-popcomfirm" title="确定删除吗？">
              <i slot="reference" title="删除" class="remove-btn el-icon-delete-solid"></i>
            </el-popconfirm>
          </div>
        </el-col>
      </el-row>
    </HsDialog>
  </div>
</template>
<script>
import html2canvas from 'html2canvas';
import HsDialog from '@/components/common/dialog/Dialog.vue';
import IconColorSelect from './IconColorSelect.vue';
import IconResultContainer from './IconResultContainer.vue';

export default {
  name: 'DialogForm',

  components: { HsDialog, IconColorSelect, IconResultContainer },

  data() {
    return {
      activeName: 'text', // text || upload || query || input
      iconColor: '#fd4648',
      iconImgModeColor: 'transparent',
      iconText: '网站',
      favicons: [],
      selectFaviconIndex: 0,

      showLab: false, // 图标库显隐
      icons: [],
    };
  },

  props: {
    title: {
      type: String,
      default: '',
    },
    // 弹窗状态：add || edit
    mode: {
      type: String,
      default: 'add',
    },
    // 表单数据键值对
    formData: {
      type: Object,
      default: () => {
        return {
          name: '杭州',
          area: '1',
        };
      },
    },
    // 表单结构
    formMap: {
      type: Array,
      default: () => [
        {
          label: '输入框示例',
          key: 'name',
          type: 'input',
        },
        {
          label: '下拉选择',
          key: 'area',
          type: 'select',
          selectOptions: [
            {
              label: '滨江区',
              value: 1,
            },
            {
              label: '萧山区',
              value: 2,
            },
          ],
        },
      ],
    },
    // 检验规则
    formRule: {
      type: Object,
      default: () => {
        return {
          name: [{ required: true, message: '必填项', trigger: 'blur' }],
        };
      },
    },
  },

  created() {
    if (this.formMap.some(el => el.type === 'icon')) {
      this.queryIcon();
    }
  },

  mounted() {
    this.activeName = this.mode === 'edit' ? 'upload' : 'text';
  },

  computed: {
    headers() {
      return {
        token: this.$store.state.manage.token,
      };
    },
    faviconIconURL() {
      return this.favicons[this.selectFaviconIndex] || '';
    },
    showCreateUrl() {
      return this.activeName === 'text' || this.activeName === 'query';
    },
    showUpload() {
      return this.activeName === 'upload';
    },
    showFindFaviconTab() {
      return this.formData['url'];
    },
  },

  methods: {
    handleSelectIcon(url) {
      this.formData.icon = url;
      this.closeLab();
    },

    getSelectByAttr(attr, data, def) {
      let value = this.LODASH.get(data, attr);
      return value || def || null;
    },

    handleRemoveIcon(path) {
      this.API.removeFile(
        { filePath: path },
        {
          notify: true,
        },
      ).then(res => {
        this.queryIcon();
      });
    },

    closeLab() {
      this.showLab = false;
    },

    queryIcon() {
      this.API.findAllIcon({}, { notify: false }).then(
        res => {
          this.icons = res.data;
        },
        { notify: false },
      );
    },

    // 根据数据生成图片，存储到服务器，获取存储地址链接
    handleCreateIconUrl() {
      let node, base64;
      if (this.activeName === 'text') {
        node = document.getElementById('icon-text-target-container');
      } else if (this.activeName === 'query') {
        if (!this.faviconIconURL) {
          this.$tips('error', '未选择图标', 'top-right', 1200);
        } else {
          node = document.getElementById('icon-img-target-container');
        }
      } else if (this.activeName === 'upload') {
        this.showLab = true;
      }

      if (node) {
        this.$nextTick(() => {
          html2canvas(node, {
            useCORS: true,
            logging: false,
            scale: window.devicePixelRatio <= 4 ? window.devicePixelRatio : 2,
          }).then(canvas => {
            canvas.toBlob(blob => {
              let file = new File([blob], 'favicon.png', { type: blob.type });
              let formdata = new FormData();
              formdata.append('file', file);
              this.API.uploadFile(formdata, {
                url: '/manage/uploadIcon?type=icon',
              }).then(res => {
                this.formData['icon'] = res.data[0].path;
                this.$tips('success', '图标上传成功', 'top-right', 1200);
              });
            });
          });
        });
      }
    },

    // tab点击时
    handleTabClick(tabInfo) {
      this.favicons = [];
      if (tabInfo.name === 'query') {
        this.queryFaviconbyUrl();
      }
    },

    // 选择远程下载的图标
    selectFavicon(i) {
      this.selectFaviconIndex = i;
    },

    // 获取el-upload的上传地址
    getUploadAction(type) {
      return this.TOOL.getUploadApi('/manage/uploadIcon?type=' + type);
    },

    // 显示图片到el-upload中
    getUploadedStyle(type) {
      return {
        '--icon': `url(${this.formData[type]})`,
      };
    },

    // 点击确定
    comfirmDialog() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$emit('comfirmForm', this.formData);
        }
      });
    },

    // 点击取消
    closeDialog() {
      this.$refs.form.resetFields();
      this.$emit('cancelForm');
    },

    // 关闭弹窗时，重置表单
    close() {
      this.$refs.form.resetFields();
    },

    // 处理表单的不可选择效果
    handleDisabled(formItem) {
      if (this.mode === 'add') {
        return formItem.addDisabled;
      } else if (this.mode === 'edit') {
        return formItem.editDisabled;
      }
    },

    // 上传成功
    handleSuccess(result, file, fileList, type) {
      if (result.data.length !== 0) {
        this.formData[type] = result.data[0].path;
      } else {
        this.$tips('error', '上传文件的链接已丢失', 'top-right', 1200);
      }
    },

    // 请求图片地址
    queryFaviconbyUrl() {
      if (!this.formData['url']) {
        this.$tips('error', '请输入网站地址', 'top-right', 1200);
        return;
      }
      this.API.findAppFavicon({ url: this.formData['url'] }, { notify: false }).then(res => {
        this.favicons = res.data;
      });
    },

    // 上传失败
    handleError() {
      this.$tips('error', '上传失败', 'top-right', 1200);
    },
  },
};
</script>

<style lang="scss" scoped>
.dialog-form {
  .icon-group {
    .favicon-group {
      display: flex;
      padding-bottom: 8px;
      overflow-x: auto;
      overflow-y: hidden;
      li {
        position: relative;
        width: 70px;
        height: 70px;
        padding: 2px;
        flex-shrink: 0;
        margin-left: 10px;
        border: 2px dashed var(--gray-400);
        overflow: hidden;
        cursor: pointer;

        &:first-of-type {
          margin-left: 0px;
        }
      }
      .select {
        border: 2px solid var(--blue-500);
        box-shadow: 0px 18px 20px -25px rgba(0, 0, 0, 0.45);
      }
    }
    .create {
      color: var(--gray-500);
    }
    .lab-group {
      width: 100%;
      height: 260px;
      border-radius: 4px;
      background-color: var(--gray-100);
    }
    .result-view-container {
      width: 70px;
      height: 70px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 4px;
      border: 1px dashed var(--gray-400);
    }
  }
}

.lab-icon-group {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  .icon-item {
    position: relative;
    width: 70px;
    height: 70px;
    border-radius: 6px;
    box-shadow: 0px 0px 20px -5px rgba(158, 158, 158, 0.2);
    transition: all 0.3s ease;
    overflow: hidden;
    cursor: pointer;

    .select-btn {
      left: 12px;
      &:hover {
        color: var(--green-400);
      }
    }
    .remove-btn {
      right: 12px;
      &:hover {
        color: var(--red-400);
      }
    }
    img {
      width: 100%;
      height: 100%;
    }
    i {
      display: none;
      position: absolute;
      top: 40%;
      font-size: 18px;
      color: var(--gray-100);
    }

    &::before {
      content: '';
      display: block;
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      background-color: var(--black-o1);
      transition: all 0.3s ease;
    }

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 26px 40px -24px var(--gray-800);
      &::before {
        background-color: var(--black-o6);
      }
      i {
        display: block;
      }
    }
  }
}

.select-active {
  .icon-item {
    i {
      display: block !important;
    }
    &::before {
      background-color: var(--black-o6) !important;
    }
  }
}

.dialog-form {
  ::v-deep .el-form {
    .el-select {
      width: 100%;
    }
    .el-input {
      width: 100%;
    }
    .el-form-item__label {
      padding-bottom: 0;
    }
    .el-upload--picture-card {
      width: 100%;
      background-image: var(--icon);
      background-size: contain;
      background-position: center center;
      background-repeat: no-repeat;
    }
  }
}
</style>
