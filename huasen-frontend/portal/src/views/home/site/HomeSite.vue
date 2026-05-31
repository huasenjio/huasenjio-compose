<!--
 * @Autor: huasenjio
 * @Date: 2021-12-08 23:24:34
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-28 00:22:35
 * @Description:
-->
<template>
  <div id="js-home-site" class="home-site" v-discolor>
    <section :id="`site-anchor-${encodeURI(index)}`" v-for="(category, index) in categorySitesData" :key="category.typeId">
      <div class="site-item" v-discolor>
        <header>
          <i class="category-icon relative left-px-2 iconfont icon-tag"></i>
          <a class="category-title" :name="category.typeName">{{ category.typeName }}</a>
          <div v-if="showTag(category)" class="w-full pb-px-4 my-px-4 overflow-x-auto overflow-y-hidden">
            <div class="inherit-bg tag-container flex items-center p-px-4 bg-gray-100 rounded-full">
              <!-- 默认占位标签 -->
              <div
                class="inherit-bg flex-shrink-0 text-12px text text-center w-px-80 px-px-2 py-px-4 ml-px-6 first:ml-px-0 hover:bg-blue-400 hover:text-white transition rounded-full pointer"
                title="全部"
                :class="{ selected: (selectedTags[category.typeId] || '') === '' }"
                @click="handleSelectTag(category, '')"
              >
                全部
              </div>
              <!-- 其他标签 -->
              <div
                class="inherit-bg flex-shrink-0 text-12px text text-center w-px-80 px-px-2 py-px-4 ml-px-6 first:ml-px-0 hover:bg-blue-400 hover:text-white transition rounded-full pointer"
                v-for="tagText in category.allTags"
                :key="tagText"
                :title="tagText"
                :class="{ selected: (selectedTags[category.typeId] || '') === tagText }"
                @click="handleSelectTag(category, tagText)"
              >
                {{ tagText }}
              </div>
            </div>
          </div>
        </header>
        <main>
          <ul v-balance>
            <div v-for="site in handleDisplaySites(category)" :key="`${category.typeId}-${site._id}`" class="site relative inherit-text" @click="openDetail(site)">
              <!-- 隐藏的测量层 - 定位参考 site-card 宽度 -->
              <div
                v-if="(site.pins || []).length > 0"
                :ref="`pinMeasure-${category.typeId}-${site._id}`"
                class="pin-measure absolute w-px-180 sm:w-px-150 h-px-16 flex justify-end invisible pointer-events-none"
                style="top: -8px; right: 0; z-index: -1;"
              >
                <div v-for="pin in site.pins" :key="pin.id" class="pin-item h-px-16 p-px-4 mr-px-2 text-12px flex justify-center items-center rounded-full whitespace-nowrap">
                  {{ pin.name }}
                </div>
              </div>
              <!-- 实际显示的 pin-group - 在 site-card 上方 -->
              <div v-if="(site.pins || []).length > 0" class="pin-group absolute right-0 w-px-180 sm:w-px-150 h-px-16 flex justify-end">
                <!-- 显示的 pin 列表 -->
                <div
                  v-for="pin in getVisiblePins(category.typeId, site)"
                  :key="pin.id"
                  :style="{ color: pin.color || 'var(--gray-500)', backgroundColor: pin.bgColor || 'var(--gray-200)' }"
                  class="pin-item h-px-16 p-px-4 mr-px-2 text-12px flex justify-center items-center rounded-full whitespace-nowrap"
                >
                  {{ pin.name }}
                </div>
                <!-- 折叠的 +n 标签 hover 显示气泡 -->
                <el-tooltip v-if="getHiddenPinCount(category.typeId, site) > 0" placement="top" effect="light" :popper-class="'pin-tooltip'">
                  <div class="pin-more h-px-16 px-px-4 mr-px-2 text-12px flex justify-center items-center rounded-full bg-gray-300 text-gray-600 cursor-pointer">
                    +{{ getHiddenPinCount(category.typeId, site) }}
                  </div>
                  <div slot="content" class="flex flex-wrap gap-px-4 max-w-px-200">
                    <div
                      v-for="pin in getHiddenPins(category.typeId, site)"
                      :key="pin.id"
                      :style="{ color: pin.color || 'var(--gray-500)', backgroundColor: pin.bgColor || 'var(--gray-200)' }"
                      class="px-px-4 py-px-2 text-12px rounded-full whitespace-nowrap"
                    >
                      {{ pin.name }}
                    </div>
                  </div>
                </el-tooltip>
              </div>
              <div :ref="`siteCard-${category.typeId}-${site._id}`" class="site-card inherit-text text w-px-180 sm:w-px-150">
                <div class="img-group">
                  <img v-lazy="{ siteUrl: site.url, iconPatch: appConfig.site.autoIconPatch }" :key="`${category.typeId}-${site._id}-${site.url}`" :src="imgUrl(site)" />
                  <div class="direct" title="直达站点" @click.stop="goSite(site)"><i class="iconfont icon-xiangyou"></i></div>
                </div>
                <div class="text-group">
                  <div class="name text" :title="site.name">{{ site.name }}</div>
                  <div class="describe inherit-text text" :title="site.description">{{ site.description }}</div>
                </div>
              </div>
            </div>
          </ul>
        </main>
      </div>
    </section>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { tool } from 'huasen-lib';
export default {
  name: 'HomeSite',
  data() {
    return {
      // 存储每个栏目选中的标签，key 为 typeId
      selectedTags: {},
      // 存储每个站点可显示的 pin 数量，key 格式: `${typeId}-${siteId}`
      visiblePinCounts: {},
      // ResizeObserver 实例
      resizeObserver: null,
      // 是否已完成初始计算
      initialized: false,
    };
  },
  computed: {
    ...mapState(['appConfig', 'categorySites']),

    categorySitesData() {
      let data = this.LODASH.cloneDeep(this.categorySites) || [];
      data.forEach(item => {
        item.allTags = this.handleCategoryAllTag(item);
      });
      return data;
    },
  },
  watch: {
    // 监听 categorySites 变化（初始数据加载）
    categorySites: {
      handler() {
        this.selectedTags = {};
        this.visiblePinCounts = {};
        this.initialized = false;
        this.$nextTick(() => {
          this.initPinDisplay();
        });
      },
      deep: true,
    },
  },
  mounted() {
    this.$store.dispatch('initLocalThemeInfo');
    this.$nextTick(() => {
      this.initPinDisplay();
    });
  },
  beforeDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  },
  methods: {
    showTag(category) {
      return this.LODASH.get(this.appConfig, 'site.openLabelClassification') && category.allTags.length !== 0;
    },
    // 处理图标链接
    imgUrl(site) {
      return site.icon;
    },

    // 选择标签
    handleSelectTag(category, tag) {
      const typeId = category.typeId;
      const current = this.selectedTags[typeId] || '';
      this.$set(this.selectedTags, typeId, current === tag ? '' : tag);
      this.$nextTick(() => {
        this.initPinDisplay();
      });
    },

    // 通过选中标签，过滤显示站点
    handleDisplaySites(category) {
      const selectedTag = this.selectedTags[category.typeId] || '';
      if (selectedTag) {
        return category.sites.filter(site => site.tags && site.tags.includes(selectedTag));
      } else {
        return category.sites;
      }
    },

    handleCategoryAllTag(type) {
      let tags = [];
      let sites = this.LODASH.get(type, 'sites') || [];
      sites.forEach(site => {
        if (Array.isArray(site.tags)) {
          tags = tags.concat(site.tags);
        }
      });
      tags = Array.from(new Set(tags));
      return tags;
    },

    // 处理置顶
    handlePin(site) {
      if (Array.isArray(site.pins)) {
        return site.pins;
      }
      return [];
    },

    // 初始化 pin 显示计算
    initPinDisplay() {
      this.setupResizeObserver();
      this.calculateAllVisiblePins();
    },

    // 设置 ResizeObserver 监听容器宽度变化
    setupResizeObserver() {
      if (typeof ResizeObserver === 'undefined') return;

      // 清理旧的 observer
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
      }

      this.resizeObserver = new ResizeObserver(entries => {
        // 使用 debounce 避免频繁触发
        if (this._resizeTimer) clearTimeout(this._resizeTimer);
        this._resizeTimer = setTimeout(() => {
          this.calculateAllVisiblePins();
        }, 50);
      });

      // 监听所有 site-card 容器
      this.categorySitesData.forEach(category => {
        const sites = this.handleDisplaySites(category);
        sites.forEach(site => {
          const refName = `siteCard-${category.typeId}-${site._id}`;
          const elements = this.$refs[refName];
          const el = this.getFirstElement(elements);
          if (el) {
            this.resizeObserver.observe(el);
          }
        });
      });
    },

    // 获取第一个元素（处理 Vue ref 可能返回数组的情况）
    getFirstElement(ref) {
      if (!ref) return null;
      if (Array.isArray(ref)) return ref[0];
      return ref;
    },

    // 计算所有站点的可见 pin 数量
    calculateAllVisiblePins() {
      const newCounts = {};
      const PIN_MORE_WIDTH = 36; // +n 标签的固定宽度

      this.categorySitesData.forEach(category => {
        const sites = this.handleDisplaySites(category);
        sites.forEach(site => {
          const pins = site.pins || [];
          if (pins.length === 0) return;

          const key = `${category.typeId}-${site._id}`;

          // 获取容器宽度
          const containerRef = this.$refs[`siteCard-${key}`];
          const containerEl = this.getFirstElement(containerRef);
          if (!containerEl) return;

          const containerWidth = containerEl.offsetWidth;

          // 获取测量层中所有 pin 元素的实际宽度
          const measureRef = this.$refs[`pinMeasure-${key}`];
          const measureEl = this.getFirstElement(measureRef);
          if (!measureEl) return;

          const pinElements = measureEl.children;

          // 计算所有 pin 的总宽度
          let totalWidth = 0;
          const pinWidths = [];
          for (let i = 0; i < pinElements.length; i++) {
            const width = pinElements[i].offsetWidth;
            pinWidths.push(width);
            totalWidth += width;
          }

          // 如果所有 pin 都能显示，不需要 +n
          if (totalWidth <= containerWidth) {
            newCounts[key] = pins.length;
            return;
          }

          // 空间不足，需要显示 +n，预留 +n 的空间
          const availableWidth = containerWidth - PIN_MORE_WIDTH;
          let visibleCount = 0;
          let currentWidth = 0;

          // 计算能放几个 pin
          for (let i = 0; i < pinWidths.length; i++) {
            if (currentWidth + pinWidths[i] <= availableWidth) {
              currentWidth += pinWidths[i];
              visibleCount++;
            } else {
              break;
            }
          }

          // 至少显示 1 个 pin（如果有的话）
          if (visibleCount === 0 && pins.length > 0) {
            visibleCount = 1;
          }

          newCounts[key] = visibleCount;
        });
      });

      this.visiblePinCounts = newCounts;
      this.initialized = true;
    },

    // 获取可见的 pin
    getVisiblePins(typeId, site) {
      const pins = site.pins || [];
      const key = `${typeId}-${site._id}`;
      const visibleCount = this.visiblePinCounts[key];

      // 如果尚未计算完成，返回所有 pin（等待测量后更新）
      if (!this.initialized || visibleCount === undefined) {
        return pins;
      }

      return pins.slice(0, visibleCount);
    },

    // 获取隐藏的 pin 数量
    getHiddenPinCount(typeId, site) {
      const pins = site.pins || [];
      const key = `${typeId}-${site._id}`;
      const visibleCount = this.visiblePinCounts[key];

      // 未计算完成时不显示 +n
      if (!this.initialized || visibleCount === undefined) {
        return 0;
      }

      return Math.max(0, pins.length - visibleCount);
    },

    // 获取隐藏的 pin 列表
    getHiddenPins(typeId, site) {
      const pins = site.pins || [];
      const key = `${typeId}-${site._id}`;
      const visibleCount = this.visiblePinCounts[key];

      if (!this.initialized || visibleCount === undefined) {
        return [];
      }

      return pins.slice(visibleCount);
    },

    goSite(site) {
      window.open(site.url, '_blank');
    },

    async openDetail(site) {
      const res = await this.API.Site.findSiteDetail({ _id: site._id }, { notify: false });
      this.$emit('openDetail', res.data);
    },
  },
};
</script>

<style lang="scss" scoped>
.home-site {
  flex: 1;
  position: relative;
  background-color: var(--gray-50);
  z-index: 1;
  section {
    width: calc(100% - 20px);
    margin: 10px auto 0 auto;
    &:first-of-type {
      margin-top: 0px;
    }
    .site-item {
      padding: 10px;
      border-radius: 2px;
      background-color: var(--gray-0);
      box-sizing: border-box;
      header {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        .category-icon {
          font-size: 20px;
          font-weight: 500;
        }
        .category-title {
          margin-left: 8px;
          font-size: 16px;
          font-weight: 500;
        }
        .selected {
          color: var(--gray-0);
          background-color: var(--blue-400);
        }
        .tag-container {
          min-width: max-content;
        }
      }
      main {
        ul {
          display: flex;
          flex-wrap: wrap;
          .site {
            margin-top: 10px;
            overflow: visible;
            .pin-group {
              top: 0; // 定位基准
              margin-top: -8px; // 向上偏移，覆盖在 site-card 上边缘
              z-index: 3;
              transition: transform 0.3s ease;
              .pin-item {
                transition: opacity 0.2s ease;
              }
              .pin-more {
                transition: background-color 0.2s ease;
                &:hover {
                  background-color: var(--blue-400);
                  color: var(--gray-0);
                }
              }
            }
            .site-card {
              position: relative;
              height: 64px;
              padding: 8px;
              display: flex;
              align-items: center;
              border-radius: 3px;
              color: var(--gray-600);
              border: 1px solid rgba(0, 0, 0, 0.02);
              box-shadow: 0px 0px 20px -5px rgba(158, 158, 158, 0.2);
              transition: box-shadow 0.3s ease;
              transition: transform 0.3s ease;
              .img-group {
                position: absolute;
                left: 10px;
                width: 42px;
                height: 42px;
                display: flex;
                justify-content: center;
                align-items: center;
                background-repeat: no-repeat;
                background-position: center center;
                background-size: 100% 100%;
                border-radius: 8px;
                overflow: hidden;
                z-index: 2;
                img {
                  position: absolute;
                  border-radius: 8px;
                  width: 100%;
                  height: 100%;
                }
                .direct {
                  position: absolute;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  border-radius: 8px;
                  width: 100%;
                  height: 100%;
                  background-color: transparent;
                  transition: all 0.3s ease;
                  pointer-events: none;
                  cursor: pointer;
                  i {
                    font-size: 24px;
                    color: transparent;
                    transition: color 0.3s ease;
                  }
                }
              }
              .text-group {
                width: calc(100% - 50px);
                display: block;
                margin-left: 60px;
                .name {
                  font-weight: 500;
                }
                .describe {
                  color: var(--gray-400);
                  font-size: 12px;
                }
              }
              &:hover {
                .img-group {
                  .direct {
                    pointer-events: all;
                    background-color: var(--black-o5);
                    i {
                      color: var(--white);
                    }
                  }
                }
              }
            }
            &:hover {
              .pin-group {
                transform: translateY(-2px);
              }
              .site-card {
                transform: translateY(-2px);
                box-shadow: 0 26px 40px -24px var(--gray-800);
              }
            }
          }
        }
      }
    }
  }
  // 动态插入样式名，实现锚点效果
  .active-anchor {
    header {
      .category-icon {
        color: var(--red-500) !important;
      }
      .category-title {
        color: var(--red-500) !important;
      }
    }
  }
}
</style>

<style lang="scss">
/* pin tooltip 全局样式 */
.pin-tooltip {
  max-width: 300px;
  padding: 8px 12px;
}
</style>
