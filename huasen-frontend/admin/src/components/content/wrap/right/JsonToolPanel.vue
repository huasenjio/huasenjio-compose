<!--
 * @Autor: huasenjio
 * @Date: 2023-03-18 16:19:38
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-06-16 23:40:40
 * @Description: 
-->
<template>
  <HsDialog title="JSON编辑器" :fullscreen="true" :visible="visible" :buttons="{ cancel: '关 闭' }" @closeDialog="close" @close="close">
    <div class="json-tool">
      <div class="json-tool-top-panel">
        <div class="title">缩进</div>
        <el-radio-group class="radio-group" v-model="retract" @input="handleRetract">
          <el-radio :label="0">0个字符</el-radio>
          <el-radio :label="2">2个字符</el-radio>
          <el-radio :label="4">4个字符</el-radio>
        </el-radio-group>
      </div>
      <el-tabs class="json-tool-body-panel" v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="JSON编辑" name="edit">
          <div class="json-tool-panel-left" :class="{ error: isError }">
            <el-input class="json-input" type="textarea" placeholder="JSON 数据" resize="none" v-model="jsonText"></el-input>
            <el-radio-group class="my-px-12" v-model="transfer" @input="handleTransfer" @mouseup.native="handleTransfer()">
              <el-radio label="object"><i class="el-icon-right font-bold"></i><span class="ml-px-2">JSON转对象</span></el-radio>
              <el-radio label="json"><i class="el-icon-back font-bold"></i><span class="ml-px-2">对象转JSON</span></el-radio>
            </el-radio-group>
            <el-input class="object-input" type="textarea" placeholder="JS 字面量" resize="none" v-model="objectText"></el-input>
          </div>
        </el-tab-pane>
        <el-tab-pane :disabled="isError" label="可视化预览" name="view">
          <div class="json-tool-panel-right">
            <VueJsonEditor class="json-edit" v-model="json" :show-btns="false" :expandedOnStart="true" mode="view"></VueJsonEditor>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </HsDialog>
</template>

<script>
import HsDialog from '@/components/common/dialog/Dialog.vue';
import VueJsonEditor from 'vue-json-editor';
import { AF } from '@/plugin/af.js';
export default {
  name: 'JsonToolPanel',

  components: {
    HsDialog,
    VueJsonEditor,
  },

  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      af: new AF(this, 100),
      activeName: 'edit', // view || edit
      retract: 0,
      transfer: 'object',
      isError: false,
      jsonText: '',
      objectText: '',
      json: {},
    };
  },

  watch: {
    jsonText: {
      handler(val) {
        try {
          let temp = JSON.parse(val);
          this.isError = false;
        } catch (err) {
          this.isError = true;
        }
      },
      immediate: true,
    },
  },

  methods: {
    handleRetract(val) {
      this.jsonText = JSON.stringify(JSON.parse(this.jsonText), null, val);
    },

    handleTransfer(val) {
      val = this.transfer;
      this.af.run(() => {
        try {
          if (val === 'object') {
            // json2对象
            let obj = JSON.parse(this.jsonText);
            let retractMap = {
              0: '',
              2: '  ',
              4: '    ',
            };
            this.objectText = this.parseValue(obj, 1, retractMap[this.retract]);
          } else if (val === 'json') {
            const sanitizedText = this.objectText.replace(/\b0(\d+)\b/g, "$1");
            let tempObj = eval(`(${sanitizedText})`);
            this.jsonText = JSON.stringify(tempObj, null, this.retract);
          }
        } catch (err) {
          this.$tips('error', '内容变换失败', 'top-right', 1200);
        }
      });
    },

    parseValue(value, level = 1, indent = '  ') {
      let type = Object.prototype.toString.call(value);
      if (type === '[object Null]') {
        // null
        return 'null';
      } else if (type === '[object Undefined]') {
        // undefined
        return 'undefined';
      } else if (type === '[object Object]') {
        // 递归对象属性
        let rows = Object.entries(value).map(([k, v]) => {
          let preWrap = indent.length === 0 ? '' : `\n${indent.repeat(level)}`;
          return `${preWrap}${k}: ${this.parseValue(v, level + 1, indent)}`;
        });
        let endWrap = indent.length === 0 || rows.length === 0 ? '' : `\n${indent.repeat(level - 1)}`;
        return `{${rows.join(', ')}${endWrap}}`;
      } else if (type === '[object Array]') {
        // 递归数组元素
        let rows = value.map(item => this.parseValue(item, level + 1, indent));
        rows = rows.map(item => {
          let preWrap = indent.length === 0 ? '' : `\n${indent.repeat(level)}`;
          return preWrap + item;
        });
        let endWrap = indent.length === 0 || rows.length === 0 ? '' : `\n${indent.repeat(level - 1)}`;
        return `[${rows.join(', ')}${endWrap}]`;
      } else if (type === '[object String]') {
        // string
        return JSON.stringify(value);
      } else {
        // number || boolean
        return value;
      }
    },

    handleTabClick(tabVM) {
      try {
        if (tabVM.name === 'view') {
          this.json = JSON.parse(this.jsonText);
        }
      } catch (err) {
        this.$tips('error', '请检查JSON是否正确', 'top-right', 1200);
      }
    },

    close() {
      this.$emit('update:visible', false);
    },
  },
};
</script>

<style lang="scss" scoped>
.json-tool {
  width: 100%;
  height: 100%;
  .json-tool-top-panel {
    width: 100%;
    height: 55px;
    .title {
      font-size: 16px;
    }
    .radio-group {
      margin: 8px auto;
    }
  }
  .json-tool-body-panel {
    width: 100%;
    height: calc(100% - 55px);
    margin-top: 20px;
    .json-tool-panel-left {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      padding: 10px;
      border-radius: 4px;
      border: 1px dashed var(--gray-400);
      background-color: var(--gray-50);
      .json-input {
        height: 100%;
        ::v-deep textarea {
          min-height: 100% !important;
        }
      }
      .el-radio-group {
        padding: 0 10px;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        .el-radio {
          margin: 5px 0;
        }
      }
      .object-input {
        height: 100%;
        ::v-deep textarea {
          min-height: 100% !important;
        }
      }
    }
    .json-tool-panel-right {
      width: 100%;
      height: 100%;
      ::v-deep .json-edit {
        height: 100%;
        .jsoneditor-vue {
          width: 100%;
          height: 100%;
          .jsoneditor-menu {
            .jsoneditor-modes {
              display: none;
            }
          }
        }
      }
    }
    .error {
      border-color: var(--red-400);
    }

    ::v-deep .el-tabs__content {
      width: 100%;
      height: calc(100% - 60px);
      .el-tab-pane {
        width: 100%;
        height: 100%;
      }
    }
  }
}
</style>
