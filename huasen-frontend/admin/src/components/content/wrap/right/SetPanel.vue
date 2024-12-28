<!--
 * @Autor: huasenjio
 * @Date: 2023-03-18 16:19:38
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-29 23:34:50
 * @Description: 
-->
<template>
  <HsDialog title="配置文件" :fullscreen="true" :visible="visible" :buttons="{ comfirm: '确 定', cancel: '取 消' }" @comfirmDialog="comfirmDialog" @closeDialog="closeDialog" @close="close">
    <div class="set-panel">
      <div class="result">
        <el-input type="textarea" autosize v-model="systemConfig"></el-input>
      </div>
    </div>
  </HsDialog>
</template>

<script>
import HsDialog from '@/components/common/dialog/Dialog.vue';
import { Validator } from 'huasen-lib';
const validator = new Validator();
const checkParamsByRules = validator.verify.bind(validator);

export default {
  name: 'SetPanel',

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
      systemConfig: '',
    };
  },

  mounted() {
    this.queryConfig();
  },

  methods: {
    queryConfig() {
      this.API.manage.findAppConfig().then(res => {
        this.systemConfig = JSON.stringify(res.data, null, 2);
      });
    },

    comfirmDialog() {
      let errText = checkParamsByRules([
        {
          value: this.systemConfig,
          rules: [
            {
              strategy: 'isNonEmpty',
              errMsg: '必填项',
            },
            {
              strategy: 'isJSONObject',
              errMsg: '请输入正确 JSON 对象',
            },
          ],
        },
      ]);
      if (errText) {
        this.$tips('error', errText, 'top-right', 1000);
        return;
      }
      this.API.manage
        .saveAppConfig({
          systemConfig: this.systemConfig,
        })
        .then(res => {});
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
.set-panel {
  .result {
    padding: 10px;
    border-radius: 4px;
    border: 1px dashed var(--gray-500);
    background-color: var(--gray-50);
  }
}
</style>
