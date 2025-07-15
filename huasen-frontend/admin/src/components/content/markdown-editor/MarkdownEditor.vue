<!--
 * @Autor: huasenjio
 * @Date: 2022-01-03 22:51:15
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-06 00:19:40
 * @Description: markdown编辑器
-->

<template>
  <div class="h-markdown-editor">
    <mavon-editor
      ref="mavonEditor"
      class="markdown-editor"
      v-model="valueCP"
      :placeholder="placeholder"
      :toolbars="this.toolbars"
      :scrollStyle="true"
      :transition="true"
      :editable="true"
      :ishljs="true"
      :tabSize="2"
      @save="save"
      @change="change"
      @imgAdd="handleImgAdd"
    >
    </mavon-editor>
  </div>
</template>

<script>
import { mavonEditor } from 'mavon-editor'; // 引入markdowm语法编辑器
import 'mavon-editor/dist/css/index.css'; // 编辑器风格样式文件

export default {
  name: 'MarkdownEditor',
  data() {
    return {
      // 工具栏配置
      toolbars: {
        bold: true, // 粗体
        italic: true, // 斜体
        header: true, // 标题
        underline: true, // 下划线
        strikethrough: true, // 删除线
        mark: true, // 标记
        superscript: true, // 上角标
        subscript: true, // 下角标
        quote: true, // 引用
        table: true, // 表格
        ol: true, // 有序列表
        ul: true, // 无序列表
        link: true, // 链接
        imagelink: true, // 图片链接
        help: false, // 帮助
        code: true, // code
        subfield: true, // 是否需要分栏
        fullscreen: true, // 全屏编辑
        readmodel: true, // 沉浸式阅读
        undo: true, // 上一步
        shortCut: false, // 启用快捷键
        trash: true, // 清空
        autofocus: false,
        save: false, // 保存（触发events中的save事件）
        navigation: true, // 导航目录
      },
      prop: {
        subfield: true, // 单双栏模式
        defaultOpen: 'preview', //edit：默认展示编辑区域；preview：默认展示预览区域
        editable: false,
        toolbarsFlag: false,
        scrollStyle: true,
      },
    };
  },
  props: {
    value: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '请输入...',
    },
    onImgAdd: {
      type: Function,
    },
  },
  computed: {
    valueCP: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('update:value', val);
      },
    },
  },
  components: {
    mavonEditor,
  },
  methods: {
    save(value, text) {
      this.$emit('onSave');
    },
    change() {
      this.$emit('change');
    },
    async handleImgAdd(position, file) {
      let url = await this.onImgAdd(position, file);
      this.$refs.mavonEditor.$img2Url(position, url);
    },
  },
};
</script>

<style lang="scss" scoped>
.h-markdown-editor {
  width: 100%;
  position: relative;
  z-index: 10;
  box-sizing: content-box;
  ::v-deep .markdown-editor {
    &.fullscreen {
      height: 100% !important;
      max-height: 100% !important;
    }
    .v-note-show {
      .v-show-content {
        ul,
        ol {
          padding-left: 15px;
        }
        ul li {
          list-style-type: disc !important;
        }
        ol li {
          list-style-type: decimal !important;
        }
        li {
          margin: 10px;
        }
        li p {
          margin: 0px 0 10px 0 !important;
        }
        ul ul,
        ul ol,
        ol ul,
        ol ol {
          margin: 0;
          padding-left: 20px; // 增加嵌套列表的缩进
        }
        ul ul li {
          list-style-type: circle !important; // 二级无序列表使用空心圆点
        }
        ul ul ul li {
          list-style-type: square !important; // 三级无序列表使用方块
        }
        ol ol li {
          list-style-type: lower-alpha !important; // 二级有序列表使用小写字母
        }
        ol ol ol li {
          list-style-type: lower-roman !important; // 三级有序列表使用小写罗马数字
        }
      }
    }
    /*滚动条宽度*/
    ::-webkit-scrollbar {
      display: none;
    }
  }
}
</style>
