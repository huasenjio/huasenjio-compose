<!--
 * @Autor: huasenjio
 * @Date: 2022-01-19 00:38:51
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-04-13 00:20:11
 * @Description: 栏目管理
-->
<template>
  <div class="column-manage">
    <TableList
      :tableData="tableData"
      :tableMap="tableMap"
      :formData.sync="searchForm"
      :formMap="searchFormMap"
      :total="total"
      :showAdd="true"
      :showOperate="true"
      @operate="handleOperate"
      @edit="handleEdit"
      @add="handleAdd"
      @remove="handleRemove"
      @search="queryData"
      @paginationChange="paginationChange"
      @updatePagination="updatePagination"
    ></TableList>
    <DialogForm
      v-if="show"
      ref="dialogForm"
      width="460"
      :title="mode == 'add' ? '添加栏目' : '编辑栏目'"
      :visible.sync="show"
      :formMap="formMap"
      :formData.sync="form"
      :formRule="rule"
      :mode="mode"
      :buttons="{ comfirm: '确 认', cancel: '取 消' }"
      @comfirmForm="save"
      @cancelForm="cancel"
    ></DialogForm>
    <SiteSelector v-if="showSiteSelector" title="配置栏目" size="500" :visible.sync="showSiteSelector" :currentColumn="currentColumn" @save="handleColumnSave"></SiteSelector>
  </div>
</template>

<script>
import TableList from '@/components/content/table-list/TableList.vue';
import DialogForm from '@/components/content/dialog-form/DialogForm.vue';
import SiteSelector from './SiteSelector.vue';

import { getElementFormValidator } from '@/plugin/strategy.js';

export default {
  name: 'ColumnManage',
  components: { TableList, DialogForm, SiteSelector },
  data() {
    return {
      // 表格相关
      total: 0,
      tableData: [],
      tableMap: [
        {
          label: '栏目名称',
          key: 'name',
        },
        {
          label: '描述',
          key: 'description',
        },
        {
          label: '封面',
          key: 'banner',
        },
        {
          label: '备注',
          key: 'remarks',
        },
        {
          label: '网址仓库',
          key: 'siteStore',
        },
        {
          label: '拓展字段',
          key: 'expand',
        },
        {
          label: '权限码',
          key: 'code',
        },
        {
          label: '是否可用',
          key: 'enabled',
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
      showSiteSelector: false,
      mode: 'add',
      formMap: [
        {
          label: '栏目名称',
          key: 'name',
          type: 'input',
        },
        {
          label: '描述',
          key: 'description',
          type: 'input',
        },
        {
          label: '封面',
          key: 'banner',
          type: 'banner',
        },
        {
          label: '备注',
          key: 'remarks',
          type: 'input',
        },
        {
          label: '网址仓库',
          key: 'siteStore',
          type: 'input',
        },
        {
          label: '拓展字段',
          key: 'expand',
          type: 'input',
        },
        {
          label: '权限码',
          key: 'code',
          type: 'select',
          selectOptions: this.CONSTANT.dictionary.code,
        },
        {
          label: '是否可用',
          key: 'enabled',
          type: 'switch',
        },
      ],
      rule: {
        name: [{ validator: getElementFormValidator(['isNoEmpty::必填项', 'minLength:2::长度不能小于2', 'maxLength:20::长度不能大于20']), trigger: 'blur' }],
        url: [{ validator: getElementFormValidator(['isNoEmpty::必填项', 'isUrl::请输入正确的网址']), trigger: 'blur' }],
        siteStore: [{ validator: getElementFormValidator(['isJSONArray::请输入JSON数组']), trigger: 'blur' }],
        expand: [{ validator: getElementFormValidator(['isJSONObject::请输入JSON对象']), trigger: 'blur' }],
      },
      form: {
        name: '',
        siteStore: '[]',
        description: '',
        banner: '',
        remarks: '',
        expand: '{}',
        enabled: true,
        code: 0,
      },
      currentColumn: {},
      pageNo: 1,
      pageSize: 10,
    };
  },
  mounted() {
    this.queryData();
  },
  methods: {
    queryData() {
      let params = Object.assign(
        {
          pageNo: this.pageNo,
          pageSize: this.pageSize,
        },
        this.searchForm,
      );
      this.API.findColumnByPage(params, {
        notify: false,
      }).then(res => {
        this.tableData = res.data.list;
        this.total = res.data.total;
        this.cancel();
      });
    },

    updatePagination(pageNo, pageSize) {
      this.pageNo = pageNo;
      this.pageSize = pageSize;
    },

    handleRemove(index, row, pageNo, pageSize) {
      this.API.removeColumn({ _id: row._id }).then(res => {
        this.queryData();
      });
    },

    handleAdd() {
      this.show = true;
      this.mode = 'add';
    },

    handleEdit(index, row) {
      this.show = true;
      this.mode = 'edit';
      this.$nextTick(() => {
        this.form = Object.assign(this.form, row);
      });
    },

    handleOperate(index, row) {
      this.showSiteSelector = true;
      this.currentColumn = { ...row };
    },

    // 分页组件发生变化
    paginationChange() {
      this.queryData();
    },

    save() {
      if (this.mode === 'edit') {
        this.API.updateColumn(this.form).then(res => {
          this.queryData();
        });
      } else if (this.mode === 'add') {
        delete this.form._id;
        delete this.form._v;
        this.API.addColumn(this.form).then(res => {
          this.queryData();
        });
      }
    },

    handleColumnSave() {
      this.showSiteSelector = false;
      this.queryData();
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

<style lang="scss" scoped>
.column-manage {
  width: 100%;
  height: calc(100% - 120px);
  padding: 10px 10px;
}
</style>
