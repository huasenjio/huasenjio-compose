<!--
 * @Autor: huasenjio
 * @Date: 2022-12-10 15:00:02
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-12-14 22:19:24
 * @Description: 
-->

<template>
  <div class="sheet">
    <el-table class="table-group" :data="displayTableData" :stripe="true" :border="true" max-height="360" highlight-current-row>
      <!-- 序号 -->
      <el-table-column type="index" width="80" label="序号"> </el-table-column>
      <!-- 数据列 -->
      <el-table-column v-for="(col, index) in tableMap" :key="index" :label="col.label" :width="col.width" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <div class="text">{{ scope.row[col.key] | emptyTip }}</div>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      class="w-full flex mt-px-20"
      :page-sizes="[10, 20, 50, 100]"
      :current-page="currentPage"
      :pageSize="pageSize"
      :total="total"
      @size-change="handlePageSizeChange"
      @current-change="handleCurrentPageChange"
      popper-class="page-size-popper"
      layout="total, sizes, prev, pager, next, jumper"
      background
    >
    </el-pagination>
  </div>
</template>

<script>
export default {
  name: 'Sheet',

  props: {
    tableMap: {
      type: Array,
      default: () => [
        {
          label: '日期',
          key: 'data',
        },
      ],
    },
    tableData: {
      type: Array,
      default: () => [
        {
          date: '1979-01-01',
        },
      ],
    },
  },

  computed: {
    total() {
      return this.tableData.length;
    },

    displayTableData() {
      let startIndex = (this.currentPage - 1) * this.pageSize;
      let endIndex = this.currentPage * this.pageSize;
      return this.tableData.slice(startIndex, endIndex);
    },
  },

  data() {
    return { pageSize: 10, currentPage: 1 };
  },

  methods: {
    handlePageSizeChange(pageSize) {
      this.pageSize = pageSize;
    },
    handleCurrentPageChange(currentPage) {
      this.currentPage = currentPage;
    },
  },
};
</script>

<style lang="scss" scoped>
.sheet {
  width: 100%;
  height: 100%;
  margin-top: 10px;
  .table-group {
    width: 100%;
    height: calc(100% - 20px - 30px);
  }
}
</style>
