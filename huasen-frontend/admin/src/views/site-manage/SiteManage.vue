<!--
 * @Autor: huasenjio
 * @Date: 2022-01-19 00:38:51
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-05-26 00:33:07
 * @Description: 
-->
<template>
  <div class="site-manage">
    <TableList
      :tableData="tableData"
      :tableMap="tableMap"
      :formData.sync="searchForm"
      :formMap="searchFormMap"
      :total="total"
      :showAdd="true"
      :showAddMany="true"
      :showSelection="true"
      @edit="handleEdit"
      @add="handleAdd"
      @addMany="handleAddMany"
      @remove="handleRemove"
      @removeMany="handleRemoveMany"
      @search="queryData"
      @paginationChange="paginationChange"
      @updatePagination="updatePagination"
    ></TableList>
    <DialogForm
      v-if="show"
      ref="dialogForm"
      width="520"
      maxHeight="480"
      :title="mode == 'add' ? '添加网链' : '编辑网链'"
      :visible.sync="show"
      :formMap="formMap"
      :formData.sync="form"
      :formRule="rule"
      :close-on-click-modal="false"
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
      total: 0,
      tableData: [],
      tableMap: [
        {
          label: '网站名称',
          key: 'name',
        },
        {
          label: '网站链接',
          key: 'url',
        },
        {
          label: '网站描述',
          key: 'description',
        },
        {
          label: '网站图标',
          key: 'icon',
        },
        {
          label: '备注',
          key: 'remarks',
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
      mode: 'add',
      formMap: [
        {
          label: '名称',
          key: 'name',
          type: 'input',
        },
        {
          label: '链接',
          key: 'url',
          type: 'input',
        },
        {
          label: '图标',
          key: 'icon',
          type: 'icon',
        },
        {
          label: '描述',
          key: 'description',
          type: 'input',
        },
        {
          label: '是否可用',
          key: 'enabled',
          type: 'switch',
        },
        {
          label: '权限码',
          key: 'code',
          type: 'select',
          selectOptions: this.CONSTANT.dictionary.code,
        },
        // {
        //   label: '所属栏目',
        //   key: 'columnCode',
        //   type: 'select',
        //   selectOptions: [],
        //   selectConfig: {
        //     'allow-create': true,
        //     filterable: true,
        //     multiple: true,
        //   },
        // },
        {
          label: '备注',
          key: 'remarks',
          type: 'input',
        },
        {
          label: '拓展字段',
          key: 'expand',
          type: 'input',
        },
      ],
      rule: {
        name: [{ validator: getElementFormValidator(['isNoEmpty::必填项', 'minLength:2::长度不能小于2', 'maxLength:20::长度不能大于20']), trigger: 'blur' }],
        url: [{ validator: getElementFormValidator(['isNoEmpty::必填项', 'isUrl::请输入正确的网址']), trigger: 'blur' }],
        expand: [{ validator: getElementFormValidator(['isJSONObject::请输入JSON对象']), trigger: 'blur' }],
      },
      form: {
        name: '',
        url: '',
        icon: '',
        description: '',
        remarks: '',
        expand: '{}',
        enabled: true,
        code: 0,
        // columnCode: [],
      },
      pageNo: 1,
      pageSize: 10,
    };
  },
  mounted() {
    this.queryData();
    // this.queryColumnData();
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
      this.API.findSiteByPage(params, {
        notify: false,
      }).then(res => {
        this.tableData = res.data.list;
        this.total = res.data.total;
        this.cancel();
      });
    },

    queryColumnData() {
      this.API.findColumnByList({}, { notify: false }).then(res => {
        let columnMap = this.getColumnMap();
        if (columnMap) {
          columnMap.selectOptions = res.data.map(item => {
            return {
              label: item.name,
              value: item._id,
            };
          });
        }
      });
    },

    // 获取到栏目的映射对象地址
    getColumnMap() {
      return this.formMap.find(el => {
        return el.key === 'columnCode';
      });
    },

    updatePagination(pageNo, pageSize) {
      this.pageNo = pageNo;
      this.pageSize = pageSize;
    },

    handleRemove(index, row) {
      this.API.removeSite({ _id: row._id }).then(res => {
        this.queryData();
      });
    },

    handleRemoveMany(list) {
      let _ids = list.map(item => item._id);
      this.API.removeManySite({ _ids }).then(res => {
        this.queryData();
      });
    },

    handleAdd() {
      this.show = true;
      this.mode = 'add';
    },

    handleAddMany() {
      this.$prompt('网链', '导入文本数据', {
        confirmButtonText: '导入',
        cancelButtonText: '取消',
        inputValidator: val => {
          try {
            let temp = JSON.parse(val);
            return !!Array.isArray(temp);
          } catch (err) {
            return false;
          }
        },
        inputErrorMessage: '数据格式：[{"name":"名称","url":"huasen.cc","description":"描述"}]',
      })
        .then(({ value }) => {
          let sites = JSON.parse(value);
          this.API.addManySite({ sites }).then(res => {
            this.queryData();
          });
        })
        .catch(err => {});
    },

    handleEdit(index, row) {
      this.show = true;
      this.mode = 'edit';
      this.$nextTick(() => {
        this.form = Object.assign(this.form, row);
      });
    },

    // 分页组件发生变化
    paginationChange() {
      this.queryData();
    },

    save() {
      let params = { ...this.form };
      if (this.mode === 'edit') {
        this.API.updateSite(params).then(res => {
          this.queryData();
        });
      } else if (this.mode === 'add') {
        delete params._id;
        delete params._v;
        this.API.addSite(params).then(res => {
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
  },
};
</script>

<style lang="scss" scoped>
.site-manage {
  width: 100%;
  height: calc(100% - 120px);
  padding: 10px 10px;
}
</style>
