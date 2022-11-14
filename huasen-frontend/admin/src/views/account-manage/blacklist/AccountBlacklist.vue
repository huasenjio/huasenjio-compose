<!--
 * @Autor: huasenjio
 * @Date: 2022-10-07 10:21:54
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-29 12:24:00
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
    ></TableList>
    <DialogForm
      width="460"
      title="添加管理员"
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
    };
  },
  mounted() {
    this.queryBlacklist();
  },
  methods: {
    queryBlacklist(pageNo, pageSize) {
      let params = Object.assign(
        {
          pageNo: pageNo,
          pageSize: pageSize,
        },
        this.searchForm,
      );
      this.API.findBlacklistByPage(params, {
        notify: false,
      }).then(res => {
        this.blacklist = res.data.list;
        this.total = res.data.total;
      });
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
      this.queryBlacklist(pageNo, pageSize);
    },
    save() {
      if (this.mode === 'edit') {
      } else if (this.mode === 'add') {
        this.API.addBlacklist(this.form).then(res => {
          this.queryBlacklist();
          this.show = false;
        });
      }
    },
    cancel() {
      this.show = false;
    },
  },
};
</script>

<style>
.account-blacklist {
}
</style>
