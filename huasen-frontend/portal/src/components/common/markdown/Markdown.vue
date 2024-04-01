<template>
  <div class="h-markdown-container">
    <div ref="areaContent" class="area-content" :style="{ paddingRight: showAnchors ? '10px' : 0 }">
      <div class="content__body">
        <div v-html="content"></div>
      </div>
      <div class="content__footer">
        <div class="text">版权说明：MIT开源协议</div>
        <div class="text">免责声明：内容仅供学习交流 禁止用于商业用途</div>
      </div>
    </div>
    <ul v-if="showAnchors && anchors.length" class="area-catalog">
      <li v-for="(item, index) in anchors" :key="index" :style="handleStyle(item)">
        <i v-if="item.tagName === 'H1' || item.tagName === 'H2' || item.tagName === 'H3'" :class="{ h1Point: item.tagName === 'H1', h2Point: item.tagName === 'H2', h3Point: item.tagName === 'H3' }" class="point"> </i>
        <div class="text pointer" :title="item.value" @click="goAnchor(item.id)">
          {{ item.value }}
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
const showdownJS = require('showdown');
const converter = new showdownJS.Converter();

converter.setOption('tables', true);
converter.setOption('emoji', true);

export default {
  name: 'Markdown',
  data() {
    return {
      anchors: [],
      content: '',
      showAnchors: true,
    };
  },
  props: {
    value: {
      type: String,
      default: () => {
        return '';
      },
    },
  },
  watch: {
    value: {
      handler(nV, oV) {
        this.content = converter.makeHtml(nV);
        this.$nextTick(() => {
          this.collectAnchors();
        });
      },
      immediate: true,
    },
  },
  mounted() {
    this.observer = new ResizeObserver(([entry]) => {
      let { width, height } = entry.contentRect;
      this.showAnchors = width < 645 ? false : true;
    });
    this.observer.observe(this.$el);
  },
  destroyed() {
    if (this.observer) {
      this.observer.unobserve(this.$el);
    }
  },
  methods: {
    handleStyle(item) {
      let style = {};
      switch (item.tagName) {
        case 'H1':
          style = { paddingLeft: '0px', fontWeight: '500' };
          break;
        case 'H2':
          style = { paddingLeft: '8px', color: '#6a6a6a' };
          break;
        case 'H3':
          style = { paddingLeft: '16px', fontSize: '12px' };
          break;
      }
      return style;
    },

    // 解析markdown文档，获取h1、h2、h3标签
    collectAnchors() {
      let contentDom = this.$refs.areaContent;
      let anchors = [...contentDom.querySelectorAll('h1, h2, h3, h4, h5, h6')].map(item => {
        return {
          id: item.id,
          tagName: item.nodeName,
          value: item.innerText,
        };
      });
      this.anchors = anchors.filter(item => {
        return item.tagName == 'H1' || item.tagName == 'H2' || item.tagName == 'H3';
      });
    },

    // 手动实现锚点跳转
    goAnchor(id) {
      let target = null;
      if (id === '') {
        // 由于mardown渲染完成后，第一个h1标签没有对应的id，所以需要手动操作
        let h1s = this.$refs.areaContent.getElementsByTagName('h1');
        target = h1s[0];
      } else {
        target = document.getElementById(id);
      }
      // 滚动操作
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.h-markdown-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  overflow: hidden;
  // 统一设置盒子模型
  * {
    box-sizing: border-box;
  }
  .area-catalog {
    position: relative;
    width: 150px;
    height: 100%;
    padding: 0 10px;
    border-left: 1px solid var(--gray-200);
    overflow-x: hidden;
    overflow-y: auto;
    li {
      width: 100%;
      display: flex;
      align-items: center;
      .h1Point {
        position: absolute;
        left: -2px;
        width: 0;
        height: 0;
        border-top: 6px solid transparent;
        border-bottom: 6px solid transparent;
        border-left: 8px solid var(--red-500);
      }
      .h2Point {
        position: absolute;
        left: -4px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: var(--red-400);
        z-index: 1;
      }
      .h3Point {
        position: absolute;
        left: -2px;
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background-color: var(--yellow-400);
        z-index: 1;
      }
    }
  }

  .area-content {
    flex: 1;
    overflow-x: hidden;
    overflow-y: auto;
    .content__footer {
      width: 100%;
      height: 58px;
      display: flex;
      justify-content: center;
      flex-direction: column;
      margin: 10px 0;
      padding: 0 10px;
      border-left: 5px solid var(--gray-300);
      border-right: 5px solid var(--gray-300);
      background-color: var(--gray-100);
    }

    ::v-deep .content__body {
      * {
        box-sizing: border-box;
      }
      pre,
      code {
        font-size: 14px;
        font-family: Roboto, 'Courier New', Consolas, Inconsolata, Courier, monospace;
        margin: auto 5px;
      }
      code {
        white-space: pre-wrap;
        border-radius: 2px;
        display: inline;
      }
      pre {
        font-size: 15px;
        line-height: 1.4em;
        display: block !important;
        background-color: var(--gray-100);
        padding: 10px 5px;
      }
      pre code {
        display: block !important;
        white-space: pre;
        overflow: auto;
        border-radius: 3px;
        padding: 10px 5px;
        background-color: var(--gray-0);
      }
      strong,
      b {
        color: var(--red-700);
      }
      em,
      i {
        color: var(--red-400);
      }
      hr {
        border: 1px solid var(--red-700);
        margin: 1.5em auto;
      }
      p {
        margin: 0 5px 1.5em 5px !important;
        img {
          width: 100%;
          margin: 10px auto;
          border-radius: 6px;
          border: 1px dashed var(--gray-300);
          padding: 4px;
        }
      }
      table,
      pre,
      dl,
      blockquote,
      q,
      ul,
      ol {
        margin: 10px 5px;
      }
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
        padding-left: 10px;
      }
      dl {
        padding: 0;
      }
      dl dt {
        font-size: 1em;
        font-weight: bold;
        font-style: italic;
      }
      dl dd {
        margin: 0 0 10px;
        padding: 0 10px;
      }
      blockquote,
      q {
        border-left: 2px solid var(--red-500);
        padding: 0 10px;
        color: var(--gray-500);
        quotes: none;
        margin-left: 1em;
      }

      blockquote::before,
      blockquote::after,
      q::before,
      q::after {
        content: none;
      }
      blockquote {
        margin: 10px 5px;
        padding: none;
      }
      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        margin: 10px 0 10px;
        padding: 0;
        color: var(--red-400) !important;
        font-style: bold !important;
        text-align: left !important;
        margin: 1.5em 5px !important;
        padding: 0.5em 0em !important;
      }

      h1 {
        margin: 1.5em 5px !important;
        margin-top: 0 !important;
        font-size: 24px !important;
        border-bottom: 1px solid var(--gray-300) !important;
      }

      h2 {
        margin: 1.2em 5px !important;
        margin-top: 0 !important;
        font-size: 20px !important;
        border-bottom: 1px dashed var(--gray-200) !important;
      }

      h3 {
        margin: 1em 5px !important;
        font-size: 18px;
        color: var(--gray-700) !important;
      }

      h4 {
        margin: 0.8em 5px !important;
        font-size: 16px;
        color: var(--gray-600) !important;
      }

      h5 {
        margin: 0.6em 5px !important;
        color: var(--gray-500) !important;
      }

      h6 {
        margin: 0.4em 5px !important;
        color: var(--gray-500) !important;
      }

      a {
        margin: 1em 5px !important;
        text-decoration: underline;
        color: var(--blue-400) !important;
      }

      table {
        width: 100%;
        padding: 0;
        border-collapse: collapse;
        border-spacing: 0;
        font-size: 1em;
        border: 0;
        margin: 0 auto;
        font: inherit;
      }

      tbody {
        margin: 0;
        padding: 0;
        border: 0;
      }

      table tr {
        border: 0;
        border-top: 1px solid var(--gray-100);
        background-color: var(--gray-0);
        margin: 0;
        padding: 0;
      }

      table tr:nth-child(2n) {
        background-color: var(--gray-200);
      }

      table tr th,
      table tr td {
        font-size: 16px;
        border: 1px solid var(--gray-100);
        margin: 0;
        padding: 5px 10px;
      }

      table tr th {
        font-weight: bold;
        color: var(--gray-100);
        border: 1px solid var(--red-400);
        background-color: var(--red-400);
      }
    }
  }
}
</style>
