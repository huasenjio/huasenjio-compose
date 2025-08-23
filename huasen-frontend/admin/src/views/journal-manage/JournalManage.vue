<!--
 * @Autor: huasenjio
 * @Date: 2022-01-19 00:38:51
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-04-13 00:19:49
 * @Description: 
-->
<template>
  <div class="journal-manage">
    <TableList
      ref="tableList"
      :tableData="tableData"
      :tableMap="tableMap"
      :formMap="searchFormMap"
      :total="total"
      :showAdd="true"
      :showRelation="true"
      @relation="handleRelation"
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
      :title="mode == 'add' ? '添加订阅源' : '编辑订阅源'"
      :visible.sync="show"
      :formMap="formMap"
      :formData.sync="form"
      :formRule="rule"
      :mode="mode"
      :close-on-click-modal="false"
      :buttons="{ comfirm: '确 认', cancel: '取 消' }"
      @comfirmForm="save"
      @cancelForm="cancel"
    ></DialogForm>
    <ColumnSelector
      v-if="showColumnSelector"
      title="配置订阅源"
      size="500"
      :visible.sync="showColumnSelector"
      :wrapperClosable="false"
      :currentJournal="currentJournal"
      @save="handleJournalSave"
    ></ColumnSelector>
  </div>
</template>

<script>
import TableList from '@/components/content/table-list/TableList.vue';
import DialogForm from '@/components/content/dialog-form/DialogForm.vue';
import ColumnSelector from './ColumnSelector.vue';
import { Validator } from 'huasen-lib';
const validator = new Validator();
const getElementFormValidator = validator.getElementFormValidator.bind(validator);

export default {
  name: 'JournalManage',
  components: { TableList, DialogForm, ColumnSelector },
  data() {
    return {
      // 表格相关
      total: 0,
      tableData: [],
      tableMap: [
        {
          label: '订阅源名称',
          key: 'name',
        },
        // {
        //   label: '栏目',
        //   key: 'columnStore',
        // },
        // {
        //   label: '拓展字段',
        //   key: 'expand',
        // },
        {
          label: '权限码',
          key: 'code',
        },
        {
          label: '是否可用',
          key: 'enabled',
        },
      ],

      searchFormMap: [
        {
          label: '名称',
          type: 'input',
          key: 'name',
          show: true,
        },
        {
          label: '权限码',
          key: 'code',
          type: 'select',
          value: undefined,
          typeConfig: {
            options: this.CONSTANT.dictionary.code,
          },
          show: true,
        },
        {
          label: '是否可用',
          key: 'enabled',
          type: 'select',
          value: undefined,
          typeConfig: {
            options: [
              {
                label: '可用',
                value: true,
              },
              {
                label: '禁用',
                value: false,
              },
            ],
          },
          show: false,
        },
      ],

      show: false,
      showColumnSelector: false,
      currentJournal: {},
      mode: 'add',
      formMap: [
        {
          label: '订阅源名称',
          key: 'name',
          type: 'input',
        },
        // {
        //   label: '栏目仓库',
        //   key: 'columnStore',
        //   type: 'input',
        // },
        // {
        //   label: '拓展字段',
        //   key: 'expand',
        //   type: 'input',
        // },
        {
          label: '权限码',
          key: 'code',
          type: 'select',
          typeConfig: {
            options: this.CONSTANT.dictionary.code,
          },
        },
        {
          label: '是否可用',
          key: 'enabled',
          type: 'switch',
        },
      ],
      rule: {
        name: [{ validator: getElementFormValidator(['isNonEmpty::必填项', 'minLength:2::长度不能小于2', 'maxLength:20::长度不能大于20']) }],
        url: [{ validator: getElementFormValidator(['isNonEmpty::必填项', 'isUrl::请输入正确的网址']) }],
        columnStore: [{ validator: getElementFormValidator(['isJSONArray::请输入JSON数组']) }],
        expand: [{ validator: getElementFormValidator(['isJSONObject::请输入JSON对象']) }],
      },
      form: {
        name: '',
        columnStore: '[]',
        expand: '{}',
        enabled: true,
        code: 0,
      },
      pageNo: 1,
      pageSize: 10,
    };
  },
  activated() {
    this.queryData();
  },
  mounted() {
    // this.queryData();
  },
  methods: {
    queryData() {
      let formData = this.$refs.tableList.getFormData();
      let params = Object.assign(
        {
          pageNo: this.pageNo,
          pageSize: this.pageSize,
        },
        formData,
      );
      this.API.journal
        .findJournalByPage(params, {
          notify: false,
        })
        .then(res => {
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
      this.API.journal.removeJournal({ _id: row._id }).then(res => {
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

    handleRelation(index, row) {
      this.showColumnSelector = true;
      this.currentJournal = { ...row };
    },

    // 分页组件发生变化
    paginationChange(pageNo, pageSize) {
      this.queryData();
    },

    save() {
      if (this.mode === 'edit') {
        this.API.journal.updateJournal(this.form).then(res => {
          this.queryData();
        });
      } else if (this.mode === 'add') {
        delete this.form._id;
        delete this.form._v;
        this.API.journal.addJournal(this.form).then(res => {
          this.queryData();
        });
      }
    },

    cancel() {
      if (this.$refs.dialogForm) {
        this.$refs.dialogForm.close();
      }
      this.show = false;
    },

    handleJournalSave() {
      this.showColumnSelector = false;
      this.queryData();
    },
  },
};
</script>

<style lang="scss" scoped>
.journal-manage {
  width: 100%;
  height: 100%;
  padding: 10px 10px;
}
</style>
