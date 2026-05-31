<!--
 * @Autor: huasenjio
 * @Date: 2022-09-12 10:40:59
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-05-28 13:25:28
 * @Description: 栏目关联网站
-->

<template>
  <HsDrawer v-bind="$attrs" v-on="$listeners">
    <div class="site-selector">
      <div class="site-selector-main">
        <div class="selected">
          <div class="header">
            <div class="title">已选择</div>
          </div>
          <ul class="site-list">
            <template v-if="relativeSites.length">
              <Draggable
                v-model="relativeSites"
                filter=".no-drap"
                animation="400"
                :group="{ name: 'sites' }"
                :ghost-class="'draggable-drag-ghost'"
                :chosen-class="'draggable-drag-chosen'"
                :drag-class="'draggable-drag-moving'"
                :fallback-tolerance="3"
                @end="onDragEnd"
              >
                <transition-group>
                  <li class="site-item drag-item" v-for="(item, index) in relativeSites" :key="`${item._id}-${index}`">
                    <i class="el-icon-rank pointer"></i>
                    <div class="name text no-drap">{{ item.name | emptyTip }}</div>
                    <div class="description text no-drap">{{ item.description | emptyTip }}</div>

                    <el-popconfirm title="确定删除吗？" @confirm="remove(item, index)">
                      <i slot="reference" class="el-icon-delete pointer remove no-drap"></i>
                    </el-popconfirm>
                  </li>
                </transition-group>
              </Draggable>
            </template>
            <el-empty v-else :image-size="60" description="请选择展示的网站"></el-empty>
          </ul>
        </div>
        <div class="selecting">
          <div class="header">
            <div class="title">待选择</div>
            <div class="search">
              <el-select v-model="searchType">
                <!-- <el-option :label="'标签名'" :value="'tag'"> </el-option> -->
                <el-option :label="'网站名'" :value="'siteName'"> </el-option>
              </el-select>
              <el-input :placeholder="searchPlaceholderText" suffix-icon="el-icon-search" v-model="searchText"> </el-input>
            </div>
          </div>
          <ul class="site-group">
            <li class="site" :class="{ active: getSelectStatus(site) }" v-for="site in displaySites" :key="site._id" @click="selectSite(site)">
              <div class="icon-group">
                <img v-lazy :src="imgUrl(site)" />
              </div>
              <div class="text-group">
                <div :title="site.name" class="name text">{{ site.name | emptyTip }}</div>
                <div :title="site.description" class="description text">{{ showTag ? site.targetTagName : site.description | emptyTip }}</div>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <!-- <div class="site-selector-footer">
        <el-button type="primary" plain @click="save">完成配置</el-button>
        <el-button type="warning" plain @click="cancel"></el-button>
      </div> -->
    </div>
  </HsDrawer>
</template>
<script>
import Draggable from 'vuedraggable';
import HsDrawer from '@/components/common/drawer/Drawer.vue';
export default {
  name: 'SiteSelector',

  components: { HsDrawer, Draggable },

  props: {
    currentColumn: {
      type: Object,
      default: () => {},
    },
  },

  data() {
    return {
      searchText: '',
      searchType: 'siteName', // tag || siteName
      sites: [],
      relativeSites: [],
    };
  },

  computed: {
    displaySites() {
      if (this.searchType === 'tag') {
        return [];
      } else {
        return this.sites.filter(item => item.name.toUpperCase().includes(this.searchText.toUpperCase()));
      }
    },
    searchPlaceholderText() {
      return '请输入' + (this.searchType === 'tag' ? '标签' : '网站') + '名称';
    },
    showTag() {
      return this.searchText && this.searchType === 'tag';
    },
  },

  watch: {
    currentColumn: {
      handler(nV, oV) {
        // 查找当前栏目关联的网站
        this.querySiteByColumn();
      },
      deep: true,
      immediate: true,
    },
  },

  mounted() {
    this.querySite();
  },

  methods: {
    onDragEnd() {
      const relativeSiteIds = this.relativeSites.map(item => item._id);
      this.API.column
        .updateBindedSiteOrder(
          {
            columnId: this.currentColumn._id,
            siteIds: relativeSiteIds,
          },
          {
            notify: false,
          },
        )
        .then(res => {
          this.$message.success('排序成功');
        })
        .catch(err => {
          this.$message.error('排序失败');
        })
        .finally(() => {
          this.querySiteByColumn();
        });
    },

    // 查询当前栏目关联的网站
    querySiteByColumn() {
      this.API.column
        .findBindedSite(
          {
            columnId: this.currentColumn._id,
          },
          {
            notify: false,
          },
        )
        .then(res => {
          const sites = res && res.data ? res.data.sites : undefined;
          this.relativeSites = Array.isArray(sites) ? sites : [];
        });
    },

    querySite() {
      this.API.site.findSiteByList({}, { notify: false }).then(res => {
        this.sites = res.data;
      });
    },

    getSelectStatus(site) {
      return this.relativeSites.some(item => item._id === site._id);
    },

    imgUrl(site) {
      return site.icon ? site.icon : require('@/assets/img/error/image-error.png');
    },

    async selectSite(site) {
      // 避免重复绑定
      if (this.getSelectStatus(site)) {
        return;
      }
      this.API.column
        .bindSite(
          {
            columnId: this.currentColumn._id,
            siteIds: [site._id],
          },
          { notify: false },
        )
        .then(res => {
          this.querySiteByColumn();
        })
        .catch(err => {
          this.$message.error('操作失败');
        });
    },

    async save() {
      this.$emit('save');
    },

    cancel() {
      this.$emit('cancel');
      this.$emit('update:visible', false);
    },

    async remove(site, index) {
      this.API.column
        .unbindSite({
          columnId: this.currentColumn._id,
          siteIds: [site._id],
        })
        .then(res => {
          this.relativeSites.splice(index, 1);
        })
        .catch(err => {
          this.$message.error('操作失败');
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.site-selector {
  width: 100%;
  height: 100%;
  .site-selector-main {
    width: 100%;
    height: calc(100% - 0px);
    overflow-x: hidden;
    overflow-y: auto;
    .selected {
      width: calc(100% - 20px);
      height: calc(40% - 20px);
      margin: 10px auto;
      padding: 10px 10px;
      border-radius: 2px;
      background-color: var(--gray-0);
      overflow-x: hidden;
      overflow-y: auto;
      .site-list {
        width: 100%;
        height: calc(100% - 34px);
        margin-top: 10px;
        overflow-x: hidden;
        overflow-y: auto;
        padding-left: 4px;
        padding-right: 4px;
        .site-item {
          display: flex;
          align-items: center;
          margin-top: 8px;
          padding: 2px;
          .name {
            max-width: 120px;
            margin-left: 10px;
          }
          .description {
            flex: 1;
            font-size: 12px;
            color: var(--gray-500);
            margin-left: 10px;
          }
          i {
            width: 20px;
            font-size: 20px;
          }
          .drag {
            color: var(--gray-600);
          }
          .remove {
            margin-left: auto;
            color: var(--red-500);
          }
        }
      }
    }
    .selecting {
      width: calc(100% - 20px);
      height: calc(60% - 20px);
      margin: 10px auto;
      padding: 10px 10px;
      border-radius: 2px;
      background-color: var(--gray-0);
      overflow-x: hidden;
      overflow-y: auto;
      .site-group {
        width: 100%;
        height: calc(100% - 90px);
        margin-top: 14px;
        display: flex;
        flex-wrap: wrap;
        align-content: flex-start;
        overflow-x: hidden;
        overflow-y: auto;
        .site {
          position: relative;
          width: 148px;
          height: 54px;
          padding: 6px 8px;
          margin-top: 10px;
          margin-left: 4px;
          display: flex;
          border: 1px solid var(--gray-100);
          background-color: var(--gray-0);
          box-shadow: 0px 0px 20px -5px rgba(158, 158, 158, 0.2);
          transition: all 0.3s ease;
          border-radius: 4px;
          cursor: pointer;
          .icon-group {
            width: 36px;
            height: 36px;
            border: 1px solid var(--gray-200);
            overflow: hidden;
            border-radius: 4px;
            img {
              width: 100%;
              height: 100%;
            }
          }
          .text-group {
            width: calc(100% - 6px - 36px);
            margin-left: 6px;
            .name {
              width: 100%;
              color: var(--gray-700);
              font-size: 14px;
            }
            .description {
              width: 100%;
              color: var(--gray-500);
              font-size: 12px;
            }
          }
          &:hover {
            transform: translateY(-3px);
            box-shadow: 0 26px 20px -24px var(--gray-700);
          }
        }
        .active {
          &::after {
            content: '';
            position: absolute;
            left: 0;
            bottom: 0;
            display: block;
            width: 100%;
            height: 3px;
            border-bottom-left-radius: 4px;
            border-bottom-right-radius: 4px;
            background-color: var(--green-400);
          }
        }
      }
    }
    .title {
      margin-bottom: 6px;
      font-size: 16px;
    }
    .search {
      display: flex;
      ::v-deep .el-select {
        width: 100px;
        margin-right: 2px;
        input {
          padding-left: 10px;
          padding-right: 25px;
        }
        .el-input__suffix {
          right: 0;
        }
      }
    }
  }
  .site-selector-footer {
    width: 100%;
    height: 60px;
    padding: 10px 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: auto;
    background-color: var(--gray-0);
  }
  /*隐藏滚动条*/
  ::-webkit-scrollbar {
    display: none;
  }
  // 自定义拖拽样式类
  .draggable-drag-ghost {
    opacity: 0.7;
    outline: 1px dashed var(--blue-400);
    background: linear-gradient(135deg, var(--blue-100), var(--blue-200));
  }

  .draggable-drag-chosen {
    background-color: var(--blue-100) !important;
  }

  .draggable-drag-moving {
    opacity: 0.9;
  }
}
</style>
