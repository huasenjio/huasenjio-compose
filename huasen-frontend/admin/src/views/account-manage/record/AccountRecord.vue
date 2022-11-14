<!--
 * @Autor: huasenjio
 * @Date: 2022-10-07 10:21:54
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-29 12:51:30
 * @Description: 管理员账号管理
-->

<template>
  <div class="account-record">
    <TableList
      :tableData="records"
      :tableMap="tableMap"
      :formData.sync="searchForm"
      :formMap="searchFormMap"
      :showAdd="false"
      :showEdit="false"
      :showCopy="true"
      :total="total"
      @remove="removeRecord"
      @search="queryRecord"
      @paginationChange="paginationChange"
    >
    </TableList>
  </div>
</template>

<script>
import TableList from '@/components/content/table-list/TableList.vue';

export default {
  name: 'AccountRecord',
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
    };
  },
  mounted() {
    this.queryRecord();
  },
  methods: {
    queryRecord(pageNo, pageSize) {
      let params = Object.assign(
        {
          pageNo: pageNo,
          pageSize: pageSize,
        },
        this.searchForm,
      );
      this.API.findRecordByPage(params, {
        notify: false,
      }).then(res => {
        this.records = res.data.list;
        this.total = res.data.total;
      });
    },
    removeRecord(index, row, pageNo, pageSize) {
      this.API.removeRecord({ _id: row._id }).then(res => {
        this.queryRecord();
      });
    },
    // 分页组件发生变化
    paginationChange(pageNo, pageSize) {
      this.queryRecord(pageNo, pageSize);
    },
  },
};
</script>

<style>
.account-record {
}
</style>
