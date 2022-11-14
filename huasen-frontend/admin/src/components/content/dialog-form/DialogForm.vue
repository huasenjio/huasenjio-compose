<!--
 * @Autor: huasenjio
 * @Date: 2022-09-12 10:40:59
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-26 00:40:07
 * @Description: 全局表单处理弹框
-->

<template>
  <HsDialog class="dialog-form" v-bind="$attrs" v-on="$listeners" @comfirmDialog="comfirmDialog" @closeDialog="closeDialog" @close="close">
    <el-form ref="form" class="form-group" :model="formData" :rules="formRule" label-position="top">
      <el-form-item v-for="(formTtem, index) in formMap" :key="index" :label="formTtem.label" :prop="formTtem.key">
        <!-- 输入框 -->
        <el-input v-if="formTtem.type === 'input'" :disabled="handleDisabled(formTtem)" v-model="formData[formTtem.key]"></el-input>
        <!-- 选择框 -->
        <el-select v-if="formTtem.type === 'select'" v-model="formData[formTtem.key]" :popper-append-to-body="false">
          <el-option v-for="(option, i) in formTtem.selectOptions" :key="i" :label="option.label" :value="option.value"> </el-option>
        </el-select>
        <!-- 单选框 -->
        <!-- 开关 -->
        <el-switch v-if="formTtem.type === 'switch'" v-model="formData[formTtem.key]"></el-switch>
        <!-- 复选框 -->
        <!-- 文本域 -->
        <el-input v-if="formTtem.type === 'textarea'" type="textarea" v-model="formData[formTtem.key]"></el-input>
        <!-- 图片 -->
        <div v-if="formTtem.type === 'icon'">
          <el-upload :headers="headers" :style="iconStyle" :action="action" :on-error="handleError" :on-success="handleSuccess" :show-file-list="false" list-type="picture-card">
            <i class="el-icon-plus"></i>
          </el-upload>
          <el-input class="mt-px-10" v-model="formData[formTtem.key]"></el-input>
        </div>
        <!-- 日期 -->
      </el-form-item>
    </el-form>
  </HsDialog>
</template>
<script>
import HsDialog from '@/components/common/dialog/Dialog.vue';
export default {
  name: 'DialogForm',

  components: { HsDialog },

  data() {
    return {};
  },

  props: {
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

  computed: {
    action() {
      return this.TOOL.getUploadApi('/manage/uploadIcon');
    },
    headers() {
      return {
        token: this.$store.state.manage.token,
      };
    },
    iconStyle() {
      return {
        '--icon': `url(${this.formData['icon']})`,
      };
    },
  },

  methods: {
    comfirmDialog() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$emit('comfirmForm');
        }
      });
    },

    closeDialog() {
      this.$refs.form.resetFields();
      this.$emit('cancelForm');
    },

    close() {
      this.$refs.form.resetFields();
    },

    handleDisabled(formItem) {
      if (this.mode === 'add') {
        return formItem.addDisabled;
      } else if (this.mode === 'edit') {
        return formItem.editDisabled;
      }
    },

    handleSuccess(result, file, FileList) {
      if (result.data.length !== 0) {
        this.formData['icon'] = result.data[0].path;
      } else {
        this.$tips('error', '无图标链接丢失', 'top-right', 1200);
      }
    },

    handleError() {
      this.$tips('error', '上传失败', 'top-right', 1200);
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
