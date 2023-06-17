<!--
 * @Autor: huasenjio
 * @Date: 2022-09-12 10:40:59
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-05-06 23:08:29
 * @Description: 网站选择器
-->
<template>
  <HsDrawer v-bind="$attrs" v-on="$listeners">
    <div class="column-selector">
      <div class="column-selector-main">
        <div class="selected">
          <div class="header">
            <div class="title">已选择</div>
          </div>
          <ul class="column-list">
            <Draggable v-model="selectColumns" filter=".no-drap" animation="400">
              <transition-group>
                <li class="column-item drag-item" v-for="(item, index) in selectColumns" :key="item._id">
                  <i class="el-icon-rank pointer"></i>
                  <div class="name text no-drap">{{ item.name | emptyTip }}</div>
                  <div class="description text no-drap">{{ item.description | emptyTip }}</div>
                  <i class="el-icon-delete pointer remove no-drap" @click="remove(item, index)"></i>
                </li>
              </transition-group>
            </Draggable>
          </ul>
        </div>
        <div class="selecting">
          <div class="header">
            <div class="title">待选择</div>
            <el-input placeholder="请输入网址名称" suffix-icon="el-icon-search" v-model="searchText"> </el-input>
          </div>
          <ul class="column-group">
            <li class="column" v-for="column in displayColumns" :key="column._id" @click="selectSite(column)">
              <div :title="column.name" class="name text">{{ column.name | emptyTip }}</div>
              <i v-if="getSelectStatus(column)" class="el-icon-success"></i>
            </li>
          </ul>
        </div>
      </div>
      <div class="column-selector-footer">
        <el-button type="primary" plain @click="save">确定配置</el-button>
        <el-button type="warning" plain @click="cancel">取消修改</el-button>
      </div>
    </div>
  </HsDrawer>
</template>
<script>
import Draggable from 'vuedraggable';
import HsDrawer from '@/components/common/drawer/Drawer.vue';

export default {
  name: 'ColumnSelector',

  components: { HsDrawer, Draggable },

  props: {
    currentJournal: {
      type: Object,
      default: () => {},
    },
  },

  data() {
    return {
      searchText: '',
      selectColumns: [],
      selectColumnIndex: [],
      columns: [],
      activeCollapseName: '',
    };
  },

  computed: {
    displayColumns() {
      return this.columns.filter(item => item.name.toUpperCase().includes(this.searchText.toUpperCase()));
    },
  },

  watch: {
    selectColumnIndex() {
      this.handleSelectSite();
    },

    columns() {
      this.handleSelectSite();
    },

    currentJournal: {
      handler(nV, oV) {
        try {
          this.selectColumnIndex = Array.isArray(JSON.parse(nV.columnStore)) ? [...JSON.parse(nV.columnStore)] : [];
        } catch (err) {
          this.selectColumnIndex = [];
        }
      },
      deep: true,
      immediate: true,
    },
  },

  mounted() {
    this.queryColumn();
  },

  methods: {
    queryColumn() {
      this.API.findColumnByList({}, { notify: false }).then(res => {
        this.columns = res.data;
      });
    },

    handleSelectSite() {
      let selectSiteTemp = [];
      this.selectColumnIndex.forEach(_id => {
        this.columns.some(column => {
          if (column._id === _id) {
            selectSiteTemp.push(column);
            // 一真则真，中断查找
            return true;
          }
        });
      });
      this.selectColumns = selectSiteTemp;
    },

    getSelectStatus(column) {
      return this.selectColumnIndex.includes(column._id);
    },

    imgUrl(column) {
      return column.icon ? column.icon : require('@/assets/img/loading/1.gif');
    },

    selectSite(column) {
      let { _id } = column;
      let existInex = this.selectColumnIndex.indexOf(_id);
      if (existInex === -1) {
        // 不存在
        this.selectColumnIndex.push(_id);
      } else {
        // 存在
        this.selectColumnIndex.splice(existInex, 1);
      }
    },

    save() {
      let columnStore = this.selectColumns.map(item => item._id);
      this.API.updateJournal({
        _id: this.currentJournal._id,
        columnStore: JSON.stringify(columnStore),
      }).then(res => {
        this.$emit('save');
      });
    },

    cancel() {
      this.$emit('cancel');
      this.$emit('update:visible', false);
    },

    remove(column, index) {
      let existInex = this.selectColumnIndex.indexOf(column._id);
      if (existInex !== -1) {
        // 不存在
        this.selectColumnIndex.splice(existInex, 1);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.column-selector {
  width: 100%;
  height: 100%;
  .column-selector-main {
    width: 100%;
    height: calc(100% - 60px);
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
      .column-list {
        .column-item {
          display: flex;
          align-items: center;
          margin-top: 8px;
          .name {
            max-width: 120px;
            margin-left: 10px;
            font-size: 14px;
            color: var(--gray-600);
          }
          .description {
            flex: 1;
            font-size: 12px;
            color: var(--gray-400);
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
      .column-group {
        .column {
          display: flex;
          align-items: center;
          padding-right: 8px;
          padding-left: 2px;
          padding-top: 5px;
          padding-bottom: 5px;
          margin-top: 10px;
          cursor: pointer;
          .name {
            width: calc(100% - 16px);
            font-size: 14px;
            color: var(--gray-600);
          }
          i {
            color: var(--green-400);
          }
          &:hover {
            background-color: var(--gray-50);
          }
        }
      }
    }
    .title {
      margin-bottom: 6px;
      font-size: 16px;
    }
  }
  .column-selector-footer {
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
}
</style>
