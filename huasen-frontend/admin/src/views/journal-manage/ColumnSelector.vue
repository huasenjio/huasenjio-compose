<!--
 * @Autor: huasenjio
 * @Date: 2022-09-12 10:40:59
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-05-06 23:08:29
 * @Description: 订阅关联栏目
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
            <template v-if="relativeColumns.length">
              <Draggable
                v-model="relativeColumns"
                animation="400"
                filter=".no-drap"
                :group="{ name: 'columns' }"
                :ghost-class="'draggable-drag-ghost'"
                :chosen-class="'draggable-drag-chosen'"
                :drag-class="'draggable-drag-moving'"
                :fallback-tolerance="3"
                @end="onDragEnd"
              >
                <transition-group>
                  <li class="column-item drag-item" v-for="(item, index) in relativeColumns" :key="item._id">
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
            <el-empty v-else :image-size="60" description="请选择展示的栏目"></el-empty>
          </ul>
        </div>
        <div class="selecting">
          <div class="header">
            <div class="title">待选择</div>
            <el-input placeholder="请输入栏目名称" suffix-icon="el-icon-search" v-model="searchText"> </el-input>
          </div>
          <ul class="column-group">
            <li class="column" v-for="column in displayColumns" :key="column._id" @click="selectColumn(column)">
              <div :title="column.name" class="name text">{{ column.name | emptyTip }}</div>
              <i v-if="getSelectStatus(column)" class="el-icon-success"></i>
            </li>
          </ul>
        </div>
      </div>
      <!-- <div class="column-selector-footer">
        <el-button type="primary" plain @click="save">确定配置</el-button>
        <el-button type="warning" plain @click="cancel">取消修改</el-button>
      </div> -->
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
      columns: [],
      relativeColumns: [],
    };
  },

  computed: {
    displayColumns() {
      return this.columns.filter(item => item.name.toUpperCase().includes(this.searchText.toUpperCase()));
    },
  },

  watch: {
    currentJournal: {
      handler(nV, oV) {
        this.queryColumnByJournal();
      },
      deep: true,
      immediate: true,
    },
  },

  mounted() {
    this.queryColumn();
  },

  methods: {
    onDragEnd() {
      const relativeColumnIds = this.relativeColumns.map(item => item._id);
      this.API.journal
        .updateBindedColumnOrder(
          {
            journalId: this.currentJournal._id,
            columnIds: relativeColumnIds,
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
          this.queryColumnByJournal();
        });
    },

    // 查询当前栏目关联的网站
    queryColumnByJournal() {
      this.API.journal
        .findBindedColumn(
          {
            journalId: this.currentJournal._id,
          },
          {
            notify: false,
          },
        )
        .then(res => {
          const columns = res && res.data ? res.data.columns : undefined;
          this.relativeColumns = Array.isArray(columns) ? columns : [];
        });
    },

    queryColumn() {
      this.API.column.findColumnByList({}, { notify: false }).then(res => {
        this.columns = res.data;
      });
    },

    selectColumn(column) {
      // 避免重复绑定
      if (this.getSelectStatus(column)) {
        return;
      }
      this.API.journal
        .bindColumn(
          {
            journalId: this.currentJournal._id,
            columnIds: [column._id],
          },
          { notify: false },
        )
        .then(res => {
          this.queryColumnByJournal();
        })
        .catch(err => {
          this.$message.error('操作失败');
        });
    },

    getSelectStatus(column) {
      return this.relativeColumns.some(item => item._id === column._id);
    },

    save() {
      this.$emit('save');
    },

    cancel() {
      this.$emit('cancel');
      this.$emit('update:visible', false);
    },

    remove(journal, index) {
      this.API.journal
        .unbindColumn({
          journalId: this.currentJournal._id,
          columnIds: [journal._id],
        })
        .then(res => {
          this.relativeColumns.splice(index, 1);
        })
        .catch(err => {
          this.$message.error('操作失败');
        });
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
    height: calc(100%);
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
        padding: 0 4px;
        .column-item {
          display: flex;
          align-items: center;
          margin-top: 8px;
          padding: 2px;
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
