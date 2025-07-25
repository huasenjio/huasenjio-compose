<template>
  <div :style="{ top, borderRadius: user.config.searchBorderRadius + 'px' }" class="home-search xl:w-px-600 lg:w-px-400 sm:w-px-350 h-px-40">
    <!-- 搜索引擎菜单 -->
    <ul class="menu" v-discolor>
      <li
        v-for="(item, index) in this.searchConfig"
        :key="index"
        :data-url="item.url"
        :data-keyword="item.key"
        @click="selectEngine(index)"
        class="xl:text-base"
        :class="{ active: activeSearchIndex === index }"
      >
        {{ item.name }}
      </li>
    </ul>
    <form @submit.prevent="doSearch">
      <!-- 搜索引擎下拉菜单 -->
      <div class="left">
        <IconBox size="24px" :icon="currentSearch.icon" radius="50%"></IconBox>
        <!-- placeholder -->
        <div v-if="showPlaceholder" class="left-placeholder">
          <div class="left-placeholder-unfocus" key="unfocus">
            按下
            <div class="focus-icon">/</div>
            立即搜索...
          </div>
        </div>
      </div>
      <!-- 搜索输入框 -->
      <div class="center">
        <el-input
          ref="searchInput"
          v-model="searchText"
          @input="handleIdea"
          @focus="handleFocus"
          @blur="handleBlur"
          @keyup.up.native.prevent="handleUp"
          @keyup.down.native.prevent="handleDown"
          @keydown.tab.shift.native.prevent.exact="handlePrevTab"
          @keydown.tab.native.prevent.exact="handleNextTab"
          :autofocus="true"
          :placeholder="isSearchInputFocus ? '搜索一下...' : ''"
          clearable
        >
        </el-input>
      </div>
      <div class="right">
        <i class="iconfont icon-md-search" @click="doSearch"></i>
      </div>
      <!-- 搜索热词面板 -->
      <ul v-if="showIdeas" class="idea gross-glass shadow animate__animated animate__fadeIn">
        <li v-for="(item, index) in ideas" :key="`${item}-${index}`" :class="{ active: index === activeIdeaIndex }" @click="doSearchByHover(item, index)">
          <!-- 站内搜索 -->
          <div v-if="instationEngine" class="instation-idea">
            <div class="name text" v-html="getHighlightText(item.name, item.target)"></div>
            <div class="describe text" v-html="getHighlightText(item.description, item.target)"></div>
          </div>
          <!-- 普通搜索 -->
          <div v-else>{{ item }}</div>
        </li>
      </ul>
    </form>
  </div>
</template>

<script>
import IconBox from '@/components/common/iconBox/IconBox.vue';
import { AF, tool } from 'huasen-lib';
import { jsonp } from '@/network/http.js';
import { mapState } from 'vuex';

import Bus from '@/plugin/event-bus.js';
import * as BusType from '@/plugin/event-type.js';

export default {
  name: 'HomeSearch',

  components: {
    IconBox,
  },

  props: {
    top: {
      type: String,
      default: '120px',
    },
  },
  data() {
    return {
      // 防抖
      af: new AF(this, 200),
      // 搜索相关
      searchText: '',
      activeSearchIndex: 0,
      activeIdeaIndex: -1,
      currentSearch: {},
      ideas: [],
      isSearchInputFocus: false,
    };
  },
  mounted() {
    // 初始化事件总线
    this.initEventBus();
  },
  destroyed() {
    Bus.unSubEv(BusType.HOME_FUCOS);
  },
  computed: {
    ...mapState(['user', 'sites', 'searchConfig']),
    // 显示建议面板
    showIdeas() {
      return this.searchText && this.ideas.length !== 0 ? true : false;
    },
    showPlaceholder() {
      return !this.searchText && !this.isSearchInputFocus;
    },
    // 站内支持搜索网络链接，直接跳转网站
    instationEngine() {
      let engine = this.currentSearch;
      return engine && engine.url === 'localhost' ? true : false;
    },
    // 扁平化网链
    flatSites() {
      let temp = [...this.sites];
      return temp;
    },
  },
  watch: {
    // 选中的建议索引
    activeSearchIndex: {
      handler(newV, oldV) {
        this.currentSearch = this.searchConfig[newV];
      },
      deep: true,
      immediate: true,
    },
    // 如果建议为空，则重置选择的建议索引
    ideas: {
      handler(nV) {
        if (nV.length === 0) {
          this.activeIdeaIndex = -1;
        }
      },
    },
    // 监听极简模式状态
    'user.config.simpleMode': {
      // 从极简模式切回普通模式
      handler(nV, oV) {
        if (oV === true && nV === false) this.initEventBus();
      },
      deep: true,
    },
    'user.config.searchEngineIndex': {
      handler(nV, oV) {
        let target = this.searchConfig[nV];
        this.activeSearchIndex = target ? nV : 0;
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    initEventBus() {
      Bus.subEv(BusType.HOME_FUCOS, key => {
        this.handleSearchFucos(key);
      });
    },
    handleFocus() {
      this.isSearchInputFocus = true;
    },
    handleBlur() {
      this.isSearchInputFocus = false;
    },
    handleSearchFucos(key) {
      if (key === '/' && this.$refs.searchInput) {
        Bus.pubEv(BusType.HOME_SCROLL_TO, 0, true);
        // setTimeout作用：等待滚动完成及组件渲染完成
        setTimeout(() => {
          this.$refs.searchInput.focus();
        }, 200);
      } else if (this.isSearchInputFocus) {
        // 因为输入框聚焦，按下任意按键，均会定位输入框，所以按下非“/”键，输入框聚焦状态，同样滚动到顶部
        Bus.pubEv(BusType.HOME_SCROLL_TO, 0, true);
      }
    },
    handleNextTab(event) {
      let index = this.activeSearchIndex < this.searchConfig.length - 1 ? this.activeSearchIndex + 1 : 0;
      this.selectEngine(index);
      this.handleIdea();
    },
    handlePrevTab(event) {
      let index = this.activeSearchIndex > 0 ? this.activeSearchIndex - 1 : this.searchConfig.length - 1;
      this.selectEngine(index);
      this.handleIdea();
    },
    // 获取关键词高亮的文字
    getHighlightText(text, target) {
      // text值可能undefined || null，所以异常处理
      text = typeof text !== 'string' ? '' : text;
      let reg = new RegExp(target, 'i');
      let hText = text.replace(reg, match => {
        return `<span class="idea-highlight"">${match}</span>`;
      });
      return hText;
    },
    handleDown() {
      if (this.ideas.length !== 0) {
        this.activeIdeaIndex = this.activeIdeaIndex == this.ideas.length - 1 ? 0 : this.activeIdeaIndex + 1;
        // 判断是否是站内搜索
        this.searchText = this.instationEngine ? this.ideas[this.activeIdeaIndex].name : this.ideas[this.activeIdeaIndex];
      }
    },
    handleUp() {
      if (this.ideas.length !== 0) {
        this.activeIdeaIndex = this.activeIdeaIndex > 0 ? this.activeIdeaIndex - 1 : this.ideas.length - 1;
        // 判断是否是站内搜索
        this.searchText = this.instationEngine ? this.ideas[this.activeIdeaIndex].name : this.ideas[this.activeIdeaIndex];
      }
    },
    // 处理键盘按下事件
    handleIdea(event) {
      this.af.run(this.getIdea);
    },
    // 进行搜索
    doSearch() {
      if (this.searchText) {
        let url = null;
        if (this.instationEngine) {
          // 站内搜索网站链接跳转
          let instationIdeaSite = this.ideas[this.activeIdeaIndex];
          if (instationIdeaSite) url = instationIdeaSite.url;
        } else {
          // 外网搜索跳转
          let params = {};
          params[this.currentSearch.key] = this.searchText;
          if (Object.keys(this.currentSearch.params) != 0) {
            params = Object.assign(params, this.currentSearch.params);
          }
          url = tool.handleURL(this.currentSearch.url, params);
        }
        if (url) window.open(url);
      }
    },
    // 查询通过hover
    doSearchByHover(value, index) {
      this.activeIdeaIndex = index;
      this.searchText = this.instationEngine ? value.name : value;
      this.doSearch();
    },
    // 获取热词
    getIdea() {
      // 排除搜索词为空的情况
      if (this.searchText == '') return;
      // 区分站内搜索和外网搜索
      if (this.instationEngine) {
        // 站内搜索，所以不请求接口，直接检索收录的网站
        let ideas = [];
        let regKeys = [];
        for (let i = 0; i <= this.searchText.length; i++) {
          for (let j = i + 1; j <= this.searchText.length; j++) {
            let regKey = this.searchText.slice(i, j);
            if (regKey) regKeys.push(regKey);
          }
        }
        regKeys.forEach(key => {
          let reg = new RegExp(key, 'i');
          this.flatSites.forEach(site => {
            // 检索站点链接或者描述
            let isTargetName = reg.exec(site.name);
            let isTargetDescribe = reg.exec(site.description);
            if (isTargetName || isTargetDescribe) {
              // 计算命中的长度，用于排序选择命中范围最大的站点
              let nameL = isTargetName ? isTargetName['0'] : '';
              let describeL = isTargetDescribe ? isTargetDescribe['0'] : '';
              ideas.push({
                ...site,
                target: nameL.length < describeL.length ? describeL : nameL,
              });
            }
          });
        });
        // 去重并且筛选命中范围最大
        let ideaMap = new Map();
        ideas.forEach(site => {
          let oV = ideaMap.get(site._id);
          let nV = oV ? (oV.target.length < site.target.length ? site : oV) : site;
          ideaMap.set(nV._id, nV);
        });
        // map集合转数组
        let realIdeas = [];
        for (const value of ideaMap.values()) {
          realIdeas.push(value);
        }
        // 排序
        this.ideas = realIdeas
          .sort((a, b) => {
            // 倒叙
            return b.target.length - a.target.length;
          })
          .slice(0, 6);
      } else {
        // 请求百度
        jsonp('https://www.baidu.com/su', {
          wd: this.searchText,
          cb: 'handleSuggestion',
        }).then(res => {
          this.ideas = res.s.slice(0, this.user.config.searchAssociationCount);
        });
      }
    },
    // 选择搜索引擎
    selectEngine(index) {
      // 搜索输入框获得光标
      this.$refs.searchInput.focus();
      // 清空其他搜索引擎建议
      this.ideas = [];
      // 选择引擎索引
      this.activeSearchIndex = index;
    },
  },
};
</script>

<style lang="scss" scoped>
.home-search {
  position: absolute;
  top: 120px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--gray-o7);
  form {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    justify-self: center;
    align-items: center;
    .left {
      position: relative;
      width: 50px;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      i {
        font-size: 24px;
        font-weight: 500;
        cursor: pointer;
      }
      .left-placeholder {
        position: absolute;
        left: 65px;
        width: 140px;
        height: 20px;
        color: var(--gray-500);
        .left-placeholder-unfocus {
          display: flex;
          align-items: center;
          .focus-icon {
            width: 14px;
            height: 18px;
            margin: 0 4px;
            border-radius: 2px;
            border: 1px solid var(--gray-500);
            text-align: center;
            line-height: 18px;
          }
        }
      }
    }
    .center {
      width: calc(100% - 100px);
      height: 100%;
      ::v-deep .el-input__inner {
        border: none;
        border-radius: 0;
        background: transparent;
        &::placeholder {
          color: var(--gray-600);
        }
      }
      ::v-deep .el-input__suffix {
        i {
          font-size: 16px;
          font-weight: 500;
          color: var(--gray-600);
        }
      }
    }
    .right {
      width: 50px;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      i {
        font-size: 24px;
        font-weight: 500;
      }
    }
    .idea {
      position: absolute;
      top: 50px;
      left: 0;
      right: 0;
      max-height: 200px;
      border-radius: 4px;
      overflow-y: auto;
      li {
        padding: 5px 10px;
        border-radius: 3px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        word-break: break-all;
        cursor: pointer;
        &:hover {
          color: var(--gray-700);
          background-color: var(--gray-o3);
        }
        .instation-idea {
          .name {
            font-weight: 600;
            color: var(--gray-700);
          }
          .describe {
            font-size: 12px;
            color: var(--gray-500);
          }
          ::v-deep .idea-highlight {
            color: var(--red-400);
          }
        }
      }
      .active {
        color: var(--gray-700);
        background-color: var(--gray-o3);
        cursor: pointer;
      }
    }
  }
  .menu {
    position: absolute;
    top: -50px;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: space-around;
    align-items: center;
    flex-flow: row nowrap;
    color: var(--gray-50);
    overflow-x: auto;
    overflow-y: hidden;
    scroll-snap-type: x mandatory;
    li {
      scroll-snap-align: center;
      flex: none;
      position: relative;
      height: 32px;
      padding: 4px 4px 0 4px;
      cursor: pointer;

      &:first-child {
        padding-left: 0;
      }
      &:last-child {
        padding-right: 0;
      }
    }
    .active {
      &::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 50%;
        transform: translateX(-50%);
        display: block;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: var(--green-500);
        outline: 1px solid var(--white-o8);
      }
    }
  }
  // 毛玻璃效果
  .gross-glass {
    background-color: var(--gray-o5);
    backdrop-filter: blur(8px);
  }
}
</style>
