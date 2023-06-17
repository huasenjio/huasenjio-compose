<!--
 * @Autor: huasenjio
 * @Date: 2022-10-07 10:21:54
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-05-14 12:13:59
 * @Description: 管理员账号管理
-->

<template>
  <div class="record-manage p-px-10">
    <TableList
      :tableData="records"
      :tableMap="tableMap"
      :formData.sync="searchForm"
      :formMap="searchFormMap"
      :showAdd="false"
      :showEdit="false"
      :showCopy="true"
      :showSelection="true"
      :total="total"
      @remove="removeRecord"
      @removeMany="handleRemoveMany"
      @search="queryRecord"
      @paginationChange="paginationChange"
      @updatePagination="updatePagination"
    >
    </TableList>
  </div>
</template>

<script>
import TableList from '@/components/content/table-list/TableList.vue';

export default {
  name: 'RecordManage',
  components: { TableList },
  data() {
    return {
      // 表格相关
      records: [],
      tableMap: [
        {
          label: '索引',
          key: 'id',
        },
        {
          label: '记录时间',
          key: 'time',
        },
        {
          label: '日志内容',
          key: 'log',
        },
      ],
      total: 0,

      // 搜索表单
      searchForm: {
        id: '',
        time: '',
      },
      searchFormMap: [
        {
          label: '索引',
          type: 'input',
          key: 'id',
        },
        {
          label: '存入时间',
          key: 'time',
          type: 'input',
        },
      ],

      pageNo: 1,
      pageSize: 10,
    };
  },
  mounted() {
    this.queryRecord();
  },
  methods: {
    queryRecord() {
      let params = Object.assign(
        {
          pageNo: this.pageNo,
          pageSize: this.pageSize,
        },
        this.searchForm,
      );
      this.API.findRecordByPage(params, {
        notify: false,
      }).then(res => {
        this.records = res.data.list.sort((a, b) => b.time - a.time);
        this.total = res.data.total;
      });
    },

    updatePagination(pageNo, pageSize) {
      this.pageNo = pageNo;
      this.pageSize = pageSize;
    },

    removeRecord(index, row, pageNo, pageSize) {
      this.API.removeRecord({ _id: row._id }).then(res => {
        this.queryRecord();
      });
    },

    handleRemoveMany(list) {
      let _ids = list.map(item => item._id);
      this.API.removeManyRecord({ _ids }).then(res => {
        this.queryRecord();
      });
    },

    // 分页组件发生变化
    paginationChange(pageNo, pageSize) {
      this.queryRecord();
    },
  },
};
</script>
<style lang="scss" scoped>
.record-manage {
  width: 100%;
  height: calc(100% - 120px);
}
</style>
