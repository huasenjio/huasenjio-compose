<template>
  <div class="h-markdown-container">
    <div ref="areaContent" class="area-content" :style="contentStyle">
      <div class="content__body" :class="bodyClass">
        <div v-html="content" v-highlight></div>
      </div>
      <div v-if="showFooter" class="content__footer">
        <slot name="footer">
          <div class="text mb-px-4">开源协议：MIT license</div>
          <div class="text">版权声明：内容仅供学习交流，禁止用于商业用途！</div>
        </slot>
      </div>
    </div>
    <ul v-if="computedShowAnchors && anchors.length" class="area-catalog" :class="catalogClass">
      <li v-for="(item, index) in anchors" :key="index" :class="getCatalogItemClass(item)">
        <i
          v-if="item.tagName === 'H1' || item.tagName === 'H2' || item.tagName === 'H3'"
          :class="{ h1Point: item.tagName === 'H1', h2Point: item.tagName === 'H2', h3Point: item.tagName === 'H3' }"
          class="point"
        >
        </i>
        <div class="text pointer" :title="item.value" @click="goAnchor(item.id)">
          {{ item.value }}
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
const MarkdownIt = require('markdown-it').default;
const anchor = require('markdown-it-anchor').default;
const mark = require('markdown-it-mark').default;
const sub = require('markdown-it-sub').default;
const sup = require('markdown-it-sup').default;
const ins = require('markdown-it-ins').default;
import hljs from 'highlight.js';
import { normalizeLooseMarkdownCodeFences } from '@huasen/shared';

// 创建 markdown-it 实例的工厂函数
function createMarkdownIt(options = {}) {
  const { html = false, theme = 'default' } = options;

  const md = new MarkdownIt({
    html: html,
    linkify: true,
    typographer: true,
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(str, { language: lang }).value;
        } catch (__) {}
      }
      return '';
    },
  })
    .use(anchor, {
      permalink: false,
      level: [1, 2, 3, 4, 5, 6],
      slugify: s =>
        String(s)
          .trim()
          .toLowerCase()
          .replace(/[^\w]+/g, '-'),
    })
    .use(mark)
    .use(ins)
    .use(sub)
    .use(sup);

  // 处理链接安全
  const defaultRender =
    md.renderer.rules.link_open ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options);
    };

  md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    const token = tokens[idx];
    const hrefIndex = token.attrIndex('href');
    if (hrefIndex >= 0) {
      const href = token.attrs[hrefIndex][1];
      const protocol = (href || '').split(':')[0].toLowerCase();
      if (!['http', 'https', 'mailto'].includes(protocol)) {
        token.attrs[hrefIndex][1] = 'about:blank';
      }
    }
    const targetIndex = token.attrIndex('target');
    if (targetIndex < 0) {
      token.attrPush(['target', '_blank']);
    } else {
      token.attrs[targetIndex][1] = '_blank';
    }
    const relIndex = token.attrIndex('rel');
    if (relIndex < 0) {
      token.attrPush(['rel', 'noopener noreferrer']);
    } else {
      token.attrs[relIndex][1] = 'noopener noreferrer';
    }
    return defaultRender(tokens, idx, options, env, self);
  };

  return md;
}

// 预创建不同配置的实例
const mdInstances = {
  noHtml: createMarkdownIt({ html: false }),
  withHtml: createMarkdownIt({ html: true }),
};

export default {
  name: 'Markdown',
  data() {
    return {
      anchors: [],
      content: '',
      internalShowAnchors: true,
    };
  },
  props: {
    // markdown 内容
    value: {
      type: String,
      default: '',
    },
    // 是否显示底部信息
    showFooter: {
      type: Boolean,
      default: true,
    },
    // 是否允许渲染 HTML 标签（AI对话用 false，文章阅读用 true）
    html: {
      type: Boolean,
      default: false,
    },
    // 样式主题：'github'（GitHub 风格）| 'default'（旧自定义风格）| 'typora'（Typora 风格）
    theme: {
      type: String,
      default: 'github',
      validator: v => ['default', 'github', 'typora'].includes(v),
    },
    // 是否显示目录锚点（true/false/'auto'，auto 时根据宽度自动判断）
    showAnchors: {
      type: [Boolean, String],
      default: 'auto',
      validator: v => [true, false, 'auto'].includes(v),
    },
    // 仅用于 AI 输出容错：修复模型生成的非标准嵌套代码围栏
    looseCodeFence: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    // 内容区样式
    contentStyle() {
      return { padding: this.computedShowAnchors ? '0 10px' : 0 };
    },
    // 内容区 body 样式类
    bodyClass() {
      return {
        [`body-${this.theme}`]: true,
      };
    },
    catalogClass() {
      return {
        [`catalog-${this.theme}`]: true,
      };
    },
    // 计算是否显示锚点
    computedShowAnchors() {
      // auto 模式使用内部状态
      if (this.showAnchors === 'auto') {
        return this.internalShowAnchors;
      }
      return this.showAnchors;
    },
  },
  watch: {
    value: {
      handler(nV) {
        // 根据 html 配置选择不同的 markdown 实例
        const md = this.html ? mdInstances.withHtml : mdInstances.noHtml;
        const source = this.looseCodeFence ? normalizeLooseMarkdownCodeFences(nV) : nV;
        this.content = md.render(source);
        this.$nextTick(() => {
          this.collectAnchors();
          this.setupImageZoom();
        });
      },
      immediate: true,
    },
  },
  mounted() {
    // 仅在文章模式下监听宽度变化
    if (this.showAnchors === 'auto') {
      this.observer = new ResizeObserver(([entry]) => {
        let { width } = entry.contentRect;
        this.internalShowAnchors = width >= 645;
      });
      this.observer.observe(this.$el);
    }
  },
  destroyed() {
    if (this.observer) {
      this.observer.unobserve(this.$el);
    }
  },
  methods: {
    getCatalogItemClass(item) {
      let className = '';
      switch (item.tagName) {
        case 'H1':
          className = 'catalog-item-h1';
          break;
        case 'H2':
          className = 'catalog-item-h2';
          break;
        case 'H3':
          className = 'catalog-item-h3';
          break;
      }
      return className;
    },

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

    setupImageZoom() {
      const container = this.$refs.areaContent;
      container.querySelectorAll('img').forEach(img => {
        img.addEventListener('click', () => {
          img.classList.toggle('zoomed');
        });
      });
    },

    goAnchor(id) {
      let target = null;
      if (id === '') {
        let h1s = this.$refs.areaContent.getElementsByTagName('h1');
        target = h1s[0];
      } else {
        target = document.getElementById(id);
      }
      if (!target) {
        return;
      }
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@huasen/ui/src/styles/markdown-github.scss';
@import '~@huasen/ui/src/styles/markdown-typora.scss';

.h-markdown-container {
  * {
    box-sizing: border-box;
  }

  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  overflow: hidden;

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
      color: var(--gray-700);
      line-height: 1.8;
      .text {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
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
    .catalog-item-h1 {
      padding-left: 0;
      font-weight: 500;
    }
    .catalog-item-h2 {
      padding-left: 8px;
      color: var(--gray-600);
    }
    .catalog-item-h3 {
      padding-left: 16px;
      color: var(--gray-500);
      font-size: 12px;
    }
    &.catalog-default {
      border-left-color: var(--gray-200);
      .catalog-item-h2 {
        color: #6a6a6a;
      }
      .catalog-item-h3 {
        color: var(--gray-700);
      }
      .h1Point {
        border-left-color: var(--red-500);
      }
      .h2Point {
        background-color: var(--red-400);
      }
      .h3Point {
        background-color: var(--yellow-400);
      }
    }
    &.catalog-github {
      border-left-color: var(--gray-300);
      li {
        color: var(--gray-700);
      }
      .catalog-item-h1 {
        color: var(--gray-900);
      }
      .catalog-item-h2 {
        color: var(--gray-700);
      }
      .catalog-item-h3 {
        color: var(--gray-600);
      }
      .h1Point {
        border-left-color: #0969da;
      }
      .h2Point {
        background-color: #0969da;
      }
      .h3Point {
        background-color: var(--gray-500);
      }
    }
    &.catalog-typora {
      border-left-color: var(--gray-300);
      li {
        color: var(--gray-700);
      }
      .catalog-item-h1 {
        color: var(--gray-900);
      }
      .catalog-item-h2 {
        color: var(--gray-600);
      }
      .catalog-item-h3 {
        color: var(--gray-500);
      }
      .h1Point {
        border-left-color: var(--gray-700);
      }
      .h2Point {
        background-color: var(--gray-500);
      }
      .h3Point {
        background-color: var(--gray-400);
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
  }
}

// ==================== Default 风格（原有自定义样式） ====================
::v-deep .body-default {
  p > code {
    padding: 2px 4px 0 4px;
    color: var(--gray-400);
    background-color: var(--gray-200);
    border-radius: 3px;
    font-size: 0.9em;
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
    white-space: pre-wrap !important;
    margin: 0 5px 1.5em 5px !important;
    img {
      max-width: 100%;
      margin: 10px auto;
      border-radius: 6px;
      border: 1px dashed var(--gray-300);
      padding: 2px;
      cursor: zoom-in;
      transition: transform 0.2s;

      &:hover {
        transform: scale(1.006);
      }

      &.zoomed {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        object-fit: contain;
        background-color: var(--black-o6);
        z-index: 9999;
        cursor: zoom-out;
        padding: 18px;
        transform: none;
        margin: 0px;
        color: var(--gray-300);
      }
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
    padding-left: 20px;
  }
  ul ul li {
    list-style-type: circle !important;
  }
  ul ul ul li {
    list-style-type: square !important;
  }
  ol ol li {
    list-style-type: lower-alpha !important;
  }
  ol ol ol li {
    list-style-type: lower-roman !important;
  }
}

// ==================== GitHub 风格 ====================
::v-deep .body-github {
  @include markdown-github-content;
}

// ==================== Typora 风格（简洁优雅） ====================
::v-deep .body-typora {
  @include markdown-typora-content;
}
</style>
