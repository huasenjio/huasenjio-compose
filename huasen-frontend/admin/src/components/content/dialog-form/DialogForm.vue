<!--
 * @Autor: huasenjio
 * @Date: 2022-09-12 10:40:59
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-05-28 13:25:13
 * @Description: 全局表单处理弹框
-->

<template>
  <div>
    <HDialog class="dialog-form" v-bind="$attrs" v-on="$listeners" :title="title" @comfirmDialog="comfirmDialog" @cancelDialog="closeDialog" @close="closeDialog">
      <template v-slot:footer-extra>
        <slot name="footer-extra"></slot>
      </template>
      <el-form ref="form" class="form-group" :model="formData" :rules="formRule" label-position="top">
        <div class="dialog-form__tips">
          <slot name="tips"></slot>
        </div>
        <div v-for="(formItem, index) in formMap" :key="index" class="form-item">
          <!-- 输入框 -->
          <el-form-item v-if="formItem.type === 'input'" :label="formItem.label" :prop="formItem.key">
            <template v-if="formItem.labelTip" slot="label">
              <span>{{ formItem.label }}</span>
              <el-tooltip :content="formItem.labelTip" placement="top">
                <i class="el-icon-info dialog-form__label-tip"></i>
              </el-tooltip>
            </template>
            <el-input :disabled="handleDisabled(formItem)" v-model="formData[formItem.key]" :placeholder="LODASH.get(formItem, 'typeConfig.placeholder', '请输入')"></el-input>
          </el-form-item>
          <!-- 数字输入框 -->
          <el-form-item v-else-if="formItem.type === 'number'" :label="formItem.label" :prop="formItem.key">
            <template v-if="formItem.labelTip" slot="label">
              <span>{{ formItem.label }}</span>
              <el-tooltip :content="formItem.labelTip" placement="top">
                <i class="el-icon-info dialog-form__label-tip"></i>
              </el-tooltip>
            </template>
            <el-input-number v-model="formData[formItem.key]" :disabled="handleDisabled(formItem)" :min="0" :max="Infinity"></el-input-number>
          </el-form-item>
          <!-- 滑块 -->
          <el-form-item v-else-if="formItem.type === 'slider'" :label="formItem.label" :prop="formItem.key">
            <template v-if="formItem.labelTip" slot="label">
              <span>{{ formItem.label }}</span>
              <el-tooltip :content="formItem.labelTip" placement="top">
                <i class="el-icon-info dialog-form__label-tip"></i>
              </el-tooltip>
            </template>
            <el-slider
              v-model="formData[formItem.key]"
              :disabled="!!LODASH.get(formItem, 'disabled')"
              :min="LODASH.get(formItem, 'typeConfig.min', 0)"
              :max="LODASH.get(formItem, 'typeConfig.max', 100)"
              :step="LODASH.get(formItem, 'typeConfig.step', 1)"
              :show-input="LODASH.get(formItem, 'typeConfig.showInput', true)"
              :show-stops="LODASH.get(formItem, 'typeConfig.showStops', false)"
            ></el-slider>
          </el-form-item>
          <!-- 选择框 -->
          <el-form-item v-else-if="formItem.type === 'select'" :label="formItem.label" :prop="formItem.key">
            <template v-if="formItem.labelTip" slot="label">
              <span>{{ formItem.label }}</span>
              <el-tooltip :content="formItem.labelTip" placement="top">
                <i class="el-icon-info dialog-form__label-tip"></i>
              </el-tooltip>
            </template>
            <el-select
              v-model="formData[formItem.key]"
              :allow-create="getSelectByAttr('typeConfig.allow-create', formItem)"
              :filterable="getSelectByAttr('typeConfig.filterable', formItem)"
              :multiple="getSelectByAttr('typeConfig.multiple', formItem)"
              :multiple-limit="getSelectByAttr('typeConfig.multiple-limit', formItem, 8)"
              :popper-append-to-body="false"
              :disabled="!!LODASH.get(formItem, 'disabled')"
              :placeholder="LODASH.get(formItem, 'typeConfig.placeholder', '请选择')"
              :clearable="getSelectByAttr('typeConfig.clearable', formItem, true)"
              @change="value => $emit('onSelectChange', formItem.key, value)"
            >
              <el-option v-for="(option, i) in formItem.typeConfig.options" :key="i" :label="option.label" :value="option.value"> </el-option>
            </el-select>
          </el-form-item>
          <!-- 开关 -->
          <el-form-item v-else-if="formItem.type === 'switch'" :label="formItem.label" :prop="formItem.key">
            <template v-if="formItem.labelTip" slot="label">
              <span>{{ formItem.label }}</span>
              <el-tooltip :content="formItem.labelTip" placement="top">
                <i class="el-icon-info dialog-form__label-tip"></i>
              </el-tooltip>
            </template>
            <el-switch :disabled="!!LODASH.get(formItem, 'disabled')" v-model="formData[formItem.key]"></el-switch>
          </el-form-item>
          <!-- 文本域 -->
          <el-form-item v-else-if="formItem.type === 'textarea'" :label="formItem.label" :prop="formItem.key">
            <template v-if="formItem.labelTip" slot="label">
              <span>{{ formItem.label }}</span>
              <el-tooltip :content="formItem.labelTip" placement="top">
                <i class="el-icon-info dialog-form__label-tip"></i>
              </el-tooltip>
            </template>
            <el-input
              :disabled="!!LODASH.get(formItem, 'disabled')"
              :autosize="{ minRows: 4 }"
              type="textarea"
              v-model="formData[formItem.key]"
              :placeholder="LODASH.get(formItem, 'typeConfig.placeholder', '请输入')"
            ></el-input>
          </el-form-item>
          <!-- 颜色选择器 -->
          <el-form-item v-else-if="formItem.type === 'color'" :label="formItem.label" :prop="formItem.key">
            <template v-if="formItem.labelTip" slot="label">
              <span>{{ formItem.label }}</span>
              <el-tooltip :content="formItem.labelTip" placement="top">
                <i class="el-icon-info dialog-form__label-tip"></i>
              </el-tooltip>
            </template>
            <div class="color-picker-wrap">
              <el-color-picker v-model="formData[formItem.key]" show-alpha></el-color-picker>
              <el-input v-model="formData[formItem.key]" :disabled="!!LODASH.get(formItem, 'disabled')" placeholder="请选择或输入颜色值">
                <template slot="prepend">
                  <span
                    :style="{
                      backgroundColor: formData[formItem.key] || 'transparent',
                      width: '20px',
                      height: '20px',
                      display: 'inline-block',
                      position: 'relative',
                      top: '2px',
                      borderRadius: '2px',
                      border: '1px solid var(--gray-400)',
                    }"
                  ></span>
                </template>
              </el-input>
            </div>
          </el-form-item>
          <!-- 图片URL（支持上传或粘贴URL/路径） -->
          <el-form-item v-else-if="formItem.type === 'imgURL'" :label="formItem.label" :prop="formItem.key">
            <template v-if="formItem.labelTip" slot="label">
              <span>{{ formItem.label }}</span>
              <el-tooltip :content="formItem.labelTip" placement="top">
                <i class="el-icon-info dialog-form__label-tip"></i>
              </el-tooltip>
            </template>
            <div class="img-url-wrap">
              <el-upload
                class="img-url-upload"
                :headers="headers"
                :action="getImgUploadAction(formItem)"
                :accept="getImgTypeAttr('accept', formItem, 'image/*')"
                :show-file-list="false"
                :disabled="!!LODASH.get(formItem, 'disabled')"
                :style="getImgUploadedStyle(formData[formItem.key])"
                :on-success="(res, file, fileList) => handleImgUploadSuccess(res, file, fileList, formItem)"
                :on-error="(err, file, fileList) => handleImgUploadError(err, file, fileList, formItem)"
              >
                <i class="el-icon-plus"></i>
              </el-upload>
              <el-input
                v-model="formData[formItem.key]"
                :disabled="!!LODASH.get(formItem, 'disabled')"
                :placeholder="getImgTypeAttr('placeholder', formItem, '或粘贴图片URL / 路径')"
                clearable
              ></el-input>
            </div>
          </el-form-item>
          <!-- 插槽 -->
          <div v-else class="form-item-extra" :key="formItem.key">
            <slot name="form-item-extra" :formItem="formItem" :formData="formData">
              <el-form-item :label="formItem.label" :prop="formItem.key">
                <template v-if="formItem.labelTip" slot="label">
                  <span>{{ formItem.label }}</span>
                  <el-tooltip :content="formItem.labelTip" placement="top">
                    <i class="el-icon-info dialog-form__label-tip"></i>
                  </el-tooltip>
                </template>
              </el-form-item>
            </slot>
          </div>
        </div>
      </el-form>
    </HDialog>
  </div>
</template>
<script>
import { HDialog } from '@huasen/ui';
import { tool } from 'huasen-lib';

export default {
  name: 'DialogForm',

  components: { HDialog },

  data() {
    return {};
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
          typeConfig: {
            options: [
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
    this.formDataTemplate = this.LODASH.cloneDeep(this.formData);
  },

  computed: {
    headers() {
      return {
        token: this.$store.state.manage.token,
      };
    },
    importSiteAction() {
      return this.TOOL.getServerApi('/site/importSite');
    },
    importSiteData() {
      return {
        columns: JSON.stringify(this.formData.columnId),
      };
    },
  },

  methods: {
    handleBeforeUpload(file, formItem) {
      formItem.files.push(file);
    },

    getSelectByAttr(attr, data, def) {
      let value = this.LODASH.get(data, attr);
      return value || def || null;
    },

    // 点击确定
    comfirmDialog() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$emit('comfirmForm', this.LODASH.cloneDeep(this.formData));
          this.$nextTick(() => {
            this.closeDialog();
          });
        }
      });
    },

    // 点击取消
    closeDialog() {
      if (this.formDataTemplate) {
        this.$emit('update:formData', this.formDataTemplate);
      }
      this.$emit('cancelForm');
    },

    // 处理表单的不可选择效果
    handleDisabled(formItem) {
      if (this.mode === 'add') {
        return formItem.addDisabled;
      } else if (this.mode === 'edit') {
        return formItem.editDisabled;
      }
    },

    // 获取 imgURL 字段的 typeConfig 属性
    getImgTypeAttr(attr, formItem, def) {
      let value = this.LODASH.get(formItem, `typeConfig.${attr}`);
      return value !== undefined && value !== null ? value : def;
    },

    // 获取 imgURL 字段的上传地址
    getImgUploadAction(formItem) {
      let uploadType = this.getImgTypeAttr('uploadType', formItem, 'img');
      return this.TOOL.getServerApi(`/file/upload?type=${uploadType}`);
    },

    // 获取 imgURL 字段的展示 URL（兼容绝对 URL 和相对路径）
    getImgDisplayUrl(url) {
      return tool.getFullURL(url || '');
    },

    // 获取 imgURL 上传按钮的预览样式
    getImgUploadedStyle(url) {
      const fullUrl = tool.getFullURL(url || '');
      return {
        '--icon': fullUrl ? `url(${fullUrl})` : '',
      };
    },

    // imgURL 字段上传成功
    handleImgUploadSuccess(response, file, fileList, formItem) {
      if (response.data && response.data.length > 0) {
        this.formData[formItem.key] = response.data[0].path;
        this.$tips('success', '图片上传成功', 'top-right', 1200);
      } else {
        this.$tips('error', '上传返回数据异常', 'top-right', 1200);
      }
    },

    // imgURL 字段上传失败
    handleImgUploadError(err, file, fileList, formItem) {
      this.$tips('error', '图片上传失败', 'top-right', 1200);
    },
  },
};
</script>

<style lang="scss" scoped>
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
  }
  .dialog-form__label-tip {
    margin-left: 4px;
    color: var(--gray-500);
    font-size: 14px;
    cursor: pointer;
  }
  .color-picker-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    ::v-deep .el-color-picker {
      flex-shrink: 0;
    }
    ::v-deep .el-input {
      flex: 1;
    }
  }
  .img-url-wrap {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 12px;

    .img-url-upload {
      width: 100%;
      height: 135px;
      ::v-deep .el-upload {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background-image: var(--icon);
        background-size: contain;
        background-position: center center;
        background-repeat: no-repeat;
        border: 1px dashed var(--gray-400);
        border-radius: 4px;

        i {
          font-size: 32px;
          color: var(--gray-400);
        }
      }
    }

    .el-input {
      flex: 1;
    }
  }
}
</style>
