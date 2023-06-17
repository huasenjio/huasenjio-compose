<!--
 * @Autor: huasenjio
 * @Date: 2023-03-18 16:19:38
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-29 23:34:15
 * @Description: 
-->
<template>
  <HsDialog title="执行动态脚本" :fullscreen="true" :visible="visible" :buttons="{ comfirm: '运 行', cancel: '关 闭' }" @comfirmDialog="comfirmDialog" @closeDialog="closeDialog" @close="close">
    <div class="runtime-panel">
      <el-form ref="form" :model="form" label-width="100px" label-position="top">
        <el-form-item label="脚本内容">
          <el-input type="textarea" placeholder="请输入可执行代码" :autosize="{ minRows: 4 }" v-model="form.runtimeScript"></el-input>
        </el-form-item>
        <el-form-item label="运行结果">
          <div class="result">
            <el-input type="textarea" autosize v-model="resultText"></el-input>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </HsDialog>
</template>

<script>
import HsDialog from '@/components/common/dialog/Dialog.vue';
export default {
  name: 'RuntimePanel',

  components: {
    HsDialog,
  },

  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      form: {
        runtimeScript: '',
      },
      rules: {},
      resultText: '无',
    };
  },

  methods: {
    comfirmDialog() {
      this.resultText = '无';
      this.API.executeRuntimeCode(this.form).then(res => {
        this.resultText = JSON.stringify(res.data, null, 4);
      });
    },

    closeDialog() {
      this.$emit('update:visible', false);
    },

    close() {
      this.$emit('update:visible', false);
    },
  },
};
</script>

<style lang="scss" scoped>
.runtime-panel {
  .result {
    padding: 10px;
    border-radius: 4px;
    border: 1px dashed var(--gray-500);
    background-color: var(--gray-50);
  }
}
</style>
