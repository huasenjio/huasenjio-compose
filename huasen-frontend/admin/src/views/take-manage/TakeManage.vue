<!--
 * @Autor: huasenjio
 * @Date: 2022-01-19 00:38:51
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-23 01:12:11
 * @Description: 
-->
<template>
  <div class="take-manage">
    <TableList
      :tableData="takes"
      :tableMap="tableMap"
      :formData.sync="searchForm"
      :formMap="searchFormMap"
      :total="total"
      :showAdd="true"
      :showOperate="true"
      @edit="editTake"
      @add="addTake"
      @remove="removeTake"
      @operate="operateTake"
      @search="queryTake"
      @paginationChange="paginationChange"
    ></TableList>
    <DialogForm
      width="460"
      title="添加订阅源"
      :visible.sync="show"
      :formMap="formMap"
      :formData.sync="form"
      :formRule="rule"
      :mode="mode"
      :buttons="{ comfirm: '确 认', cancel: '取 消' }"
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
  name: 'TakeManage',
  components: { TableList, DialogForm },
  data() {
    return {
      // 表格相关
      takes: [],
      total: 0,
      tableMap: [
        {
          label: '发布者名称',
          key: 'name',
        },
        {
          label: '权限码',
          key: 'code',
        },
        {
          label: '是否开启订阅',
          key: 'enabled',
        },
        {
          label: '站点资源',
          key: 'series',
        },
        {
          label: '配置',
          key: 'config',
        },
      ],

      // 搜索表单
      searchForm: {
        name: '',
        code: '',
      },
      searchFormMap: [
        {
          label: '名称',
          type: 'input',
          key: 'name',
        },
        {
          label: '权限码',
          key: 'code',
          type: 'select',
          selectOptions: this.CONSTANT.dictionary.code,
        },
      ],

      show: false,
      mode: 'add',
      formMap: [
        {
          label: '订阅源名称',
          key: 'name',
          type: 'input',
        },
        {
          label: '是否开启订阅',
          key: 'enabled',
          type: 'switch',
        },
        {
          label: '权限码',
          key: 'code',
          type: 'select',
          selectOptions: this.CONSTANT.dictionary.code,
        },
        {
          label: '网链资源',
          key: 'series',
          type: 'input',
        },
        {
          label: '配置',
          key: 'config',
          type: 'textarea',
        },
      ],
      rule: {
        name: [{ validator: getElementFormValidator(['isNoEmpty::必填项', 'minLength:4::长度小于4', 'maxLength:8::长度大于8']), trigger: 'blur' }],
        series: [{ validator: getElementFormValidator(['isSeries::请输入合法JSON字符串']), trigger: 'blur' }],
        config: [{ validator: getElementFormValidator(['isConfig::请输入合法JSON字符串']), trigger: 'blur' }],
      },
      form: {
        name: '',
        enabled: true,
        code: 0,
        series: '',
        config: '',
      },
    };
  },
  mounted() {
    this.queryTake();
  },
  methods: {
    queryTake(pageNo, pageSize) {
      let params = Object.assign(
        {
          pageNo: pageNo,
          pageSize: pageSize,
        },
        this.searchForm,
      );
      this.API.findTakeByPage(params, {
        notify: false,
      }).then(res => {
        this.takes = res.data.list;
        this.total = res.data.total;
      });
    },

    removeTake(index, row, pageNo, pageSize) {
      this.API.removeTake({ _id: row._id }).then(res => {
        this.queryTake();
      });
    },

    addTake() {
      this.show = true;
      this.mode = 'add';
    },

    operateTake(index, row) {
      this.$router.push({ name: 'Take', params: row });
    },

    editTake(index, row) {
      this.show = true;
      this.mode = 'edit';
      this.$nextTick(() => {
        this.form = Object.assign(this.form, row);
      });
    },

    // 分页组件发生变化
    paginationChange(pageNo, pageSize) {
      this.queryTake(pageNo, pageSize);
    },

    save() {
      if (this.mode === 'edit') {
        this.API.updateTake(this.form).then(res => {
          this.queryTake();
          this.show = false;
        });
      } else if (this.mode === 'add') {
        delete this.form._id;
        delete this.form._v;
        this.API.addTake(this.form).then(res => {
          this.queryTake();
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

<style lang="scss" scoped>
.take-manage {
  padding: 10px 10px;
}
</style>
