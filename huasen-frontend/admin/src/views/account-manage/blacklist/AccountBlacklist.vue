<!--
 * @Autor: huasenjio
 * @Date: 2022-10-07 10:21:54
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-04-13 00:20:47
 * @Description: 管理员账号管理
-->

<template>
  <div class="account-blacklist">
    <TableList
      :tableData="blacklist"
      :tableMap="tableMap"
      :formData.sync="searchForm"
      :formMap="searchFormMap"
      :showAdd="true"
      :showEdit="false"
      :total="total"
      @edit="editBlacklist"
      @add="addBlacklist"
      @remove="removeBlacklist"
      @search="queryBlacklist"
      @paginationChange="paginationChange"
      @updatePagination="updatePagination"
    ></TableList>
    <DialogForm
      v-if="show"
      ref="dialogForm"
      width="460"
      :title="mode == 'add' ? '添加黑名单' : '编辑黑名单'"
      :visible.sync="show"
      :mode="mode"
      :buttons="{ comfirm: '确 认', cancel: '取 消' }"
      :formMap="formMap"
      :formData.sync="form"
      :formRule="rule"
      @comfirmForm="save"
      @cancelForm="cancel"
    ></DialogForm>
  </div>
</template>

<script>
import TableList from '@/components/content/table-list/TableList.vue';
import DialogForm from '@/components/content/dialog-form/DialogForm.vue';
import { getElementFormValidator } from '@/plugin/strategy.js';
export default {
  name: 'AccountBlacklist',
  components: { TableList, DialogForm },
  data() {
    return {
      // 表格相关
      blacklist: [],
      tableMap: [
        {
          label: 'IP地址',
          key: 'ip',
        },
      ],
      total: 0,

      // 搜索表单
      searchForm: {
        ip: '',
      },

      // 搜索表单
      searchFormMap: [
        {
          label: 'IP地址',
          type: 'input',
          key: 'ip',
        },
      ],

      // 添加编辑表单
      show: false,
      mode: 'add',
      formMap: [
        {
          label: 'IP地址',
          key: 'ip',
          type: 'input',
          editDisabled: true,
        },
      ],

      rule: {
        ip: [{ validator: getElementFormValidator(['isNoEmpty::必填项', 'isIp::请输入正确IP地址']), trigger: 'blur' }],
      },

      form: {
        ip: '',
      },

      pageNo: 1,
      pageSize: 10,
    };
  },
  mounted() {
    this.queryBlacklist();
  },
  methods: {
    queryBlacklist() {
      let params = Object.assign(
        {
          pageNo: this.pageNo,
          pageSize: this.pageSize,
        },
        this.searchForm,
      );
      this.API.findBlacklistByPage(params, {
        notify: false,
      }).then(res => {
        this.blacklist = res.data.list;
        this.total = res.data.total;
        this.cancel();
      });
    },

    updatePagination(pageNo, pageSize) {
      this.pageNo = pageNo;
      this.pageSize = pageSize;
    },

    removeBlacklist(index, row, pageNo, pageSize) {
      this.API.removeBlacklist({ ip: row.ip }).then(res => {
        this.queryBlacklist();
      });
    },
    addBlacklist() {
      this.show = true;
      this.mode = 'add';
    },
    editBlacklist(index, row) {
      this.show = true;
      this.mode = 'edit';
      this.$nextTick(() => {
        this.form = Object.assign(this.form, row);
      });
    },
    // 分页组件发生变化
    paginationChange(pageNo, pageSize) {
      this.queryBlacklist();
    },
    save() {
      if (this.mode === 'edit') {
      } else if (this.mode === 'add') {
        this.API.addBlacklist(this.form).then(res => {
          this.queryBlacklist();
        });
      }
    },
    cancel() {
      if (this.$refs.dialogForm) {
        this.$refs.dialogForm.close();
      }
      this.show = false;
    },
  },
};
</script>

<style>
.account-blacklist {
  width: 100%;
  height: 100%;
}
</style>
