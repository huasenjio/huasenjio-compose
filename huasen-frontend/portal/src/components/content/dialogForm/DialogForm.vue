<!--
 * @Autor: huasenjio
 * @Date: 2022-09-12 10:40:59
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-11-05 21:09:42
 * @Description: 全局表单处理弹框
-->

<template>
  <HsDialog class="dialog-form" v-bind="$attrs" v-on="$listeners" @comfirmDialog="comfirmDialog" @closeDialog="closeDialog">
    <el-form ref="form" class="form-group" :model="formData" :rules="formRule" label-position="top">
      <el-form-item v-for="(item, index) in formMap" :key="index" :label="item.label" :prop="item.key">
        <!-- 输入框 -->
        <el-input v-if="item.type === 'input'" v-model="formData[item.key]"></el-input>
        <!-- 选择框 -->
        <el-select v-if="item.type === 'select'" v-model="formData[item.key]" :popper-append-to-body="false">
          <el-option v-for="(option, i) in item.selectOptions" :key="i" :label="option.label" :value="option.value"> </el-option>
        </el-select>
        <!-- 单选框 -->
        <!-- 复选框 -->
        <!-- 文本域 -->
        <el-input v-if="item.type === 'textarea'" type="textarea" v-model="formData[item.key]"></el-input>
        <!-- 图片 -->
        <!-- 日期 -->
      </el-form-item>
    </el-form>
  </HsDialog>
</template>
<script>
import HsDialog from '@/components/content/dialog/Dialog.vue';
export default {
  name: 'DialogForm',

  components: { HsDialog },

  props: {
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
}
</style>
