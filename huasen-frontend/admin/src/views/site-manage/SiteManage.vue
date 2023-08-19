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
    <DialogForm
      v-if="showImport"
      ref="dialogImportForm"
      width="420"
      maxHeight="480"
      title="导入站点"
      :visible.sync="showImport"
      :formMap="importFormMap"
      :formData.sync="importForm"
      :formRule="importRule"
      :close-on-click-modal="false"
      :mode="importMode"
      :buttons="{ comfirm: '确 认', cancel: '取 消' }"
      @comfirmForm="saveImportSite"
      @cancelForm="cancelImportSite"
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
      showImport: false,
      mode: 'add',
      importMode: 'add',
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
        {
          label: '网站标签',
          key: 'siteTag',
          type: 'select',
          selectOptions: [],
          selectConfig: {
            'allow-create': true,
            filterable: true,
            multiple: true,
          },
        },
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
      importFormMap: [
        {
          label: '网站标签',
          key: 'siteTag',
          type: 'select',
          selectOptions: [],
          selectConfig: {
            'allow-create': true,
            filterable: true,
            multiple: true,
          },
        },
        {
          label: '所属栏目',
          key: 'columnId',
          type: 'select',
          selectOptions: [],
          selectConfig: {
            filterable: true,
            multiple: true,
          },
        },
        {
          label: '网站数据',
          key: 'siteData',
          type: 'textarea',
        },
      ],
      rule: {
        name: [{ validator: getElementFormValidator(['isNoEmpty::必填项', 'minLength:2::长度不能小于2', 'maxLength:20::长度不能大于20']), trigger: 'blur' }],
        url: [{ validator: getElementFormValidator(['isNoEmpty::必填项', 'isUrl::请输入正确的网址']), trigger: 'blur' }],
        expand: [{ validator: getElementFormValidator(['isJSONObject::请输入JSON对象']), trigger: 'blur' }],
      },
      importRule: {
        siteData: [{ validator: getElementFormValidator(['isSiteList::格式：[{"name":"名称","url":"http://huasen.cc","description":"描述"}]']), trigger: 'blur' }],
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
        siteTag: [],
      },
      importForm: {
        siteTag: [],
        columnId: [],
        siteData: '',
      },
      pageNo: 1,
      pageSize: 10,
    };
  },

  mounted() {
    this.queryData();
    this.queryColumnData();
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
      this.API.findSiteTagByList({}, { notify: false }).then(res => {
        let existObj = this.formMap.find(item => item.key === 'siteTag');
        let importExistObj = this.importFormMap.find(item => item.key === 'siteTag');
        let tags = res.data.map(tagName => {
          return {
            label: tagName,
            value: tagName,
          };
        });
        if (existObj) {
          existObj.selectOptions = [...tags];
        }
        if (importExistObj) {
          importExistObj.selectOptions = [...tags];
        }
      });
    },

    queryColumnData() {
      this.API.findColumnByList({}, { notify: false }).then(res => {
        let columnItem = this.importFormMap.find(el => el.key === 'columnId');
        if (columnItem) {
          columnItem.selectOptions = res.data.map(item => {
            return {
              label: item.name,
              value: item._id,
            };
          });
        }
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
      this.showImport = true;
    },

    handleEdit(index, row) {
      this.show = true;
      this.mode = 'edit';
      this.$nextTick(() => {
        let siteTag = [];
        try {
          // 数据处理
          let expand = JSON.parse(row.expand || '{}');
          siteTag = expand.tag || [];
        } catch (err) {
          this.$tips('error', '数据处理失败', 'top-right', 1200);
        }
        this.form = Object.assign(this.form, row, { siteTag: siteTag });
      });
    },

    // 分页组件发生变化
    paginationChange() {
      this.queryData();
    },

    save() {
      let params = { ...this.form };
      try {
        let expand = JSON.parse(params.expand || '{}');
        expand.tag = params.siteTag;
        // 利用代码报错中断
        let newExpand = JSON.stringify(expand);
        params.expand = newExpand;
      } catch (err) {}

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

    saveImportSite() {
      let params = { ...this.importForm };
      try {
        let sites = JSON.parse(params.siteData);
        sites.forEach(item => {
          if (params.siteTag.length) {
            // 忽略JSON数据中的tag数据
            let expandTemp = {};
            expandTemp.tag = params.siteTag;
            item.expand = JSON.stringify(expandTemp);
          }
        });
        // 上传
        this.API.addManySite({ sites }).then(res => {
          let siteIds = res.data.map(item => item._id);
          // 刷新数据列表
          this.queryData();
          // 导入站点绑定到栏目
          this.bindSiteToColumn(params.columnId, siteIds);
          this.cancelImportSite();
        });
      } catch (err) {
        this.$tips('error', '数据格式非法', 'top-right', 1200);
      }
    },

    // 绑定栏目和网链
    bindSiteToColumn(columnIds, siteIds) {
      if (columnIds.length && siteIds.length) {
        this.API.bindSiteToColumn({ columnIds, siteIds }, { notify: false });
      }
    },

    cancelImportSite() {
      if (this.$refs.dialogImportForm) {
        this.$refs.dialogImportForm.close();
      }
      this.showImport = false;
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
