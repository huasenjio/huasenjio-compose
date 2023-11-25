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
  name: 'SiteManage',
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
          width: 100,
        },
        {
          label: '备注',
          key: 'remarks',
        },
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
          label: '置顶标记',
          key: 'sitePin',
          type: 'select',
          selectOptions: this.CONSTANT.dictionary.pin,
          selectConfig: {
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
            'allow-create': true,
            filterable: true,
            multiple: true,
          },
        },
        {
          label: '权限码',
          key: 'code',
          type: 'select',
          selectOptions: this.CONSTANT.dictionary.code,
        },
        {
          label: '备注',
          key: 'remarks',
          type: 'input',
        },
        {
          label: '是否可用',
          key: 'enabled',
          type: 'switch',
        },
        // {
        //   label: '拓展字段',
        //   key: 'expand',
        //   type: 'input',
        // },
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
        expand: [{ validator: getElementFormValidator(['isNoEmpty::必填项', 'isJSONObject::请输入JSON对象']), trigger: 'blur' }],
      },
      importRule: {
        siteData: [{ validator: getElementFormValidator(['isSiteList::格式: [{"name":"名称","url":"http://huasen.cc/","description":"描述"}]']), trigger: 'blur' }],
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
        sitePin: [],
        columnId: [],
      },
      importForm: {
        siteTag: [],
        columnId: [],
        siteData: '',
      },
      initForm: null,
      pageNo: 1,
      pageSize: 10,

      siteTagNameOptions: [],
      columnOptions: [],
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
      // 请求站点数据
      this.API.findSiteByPage(params, {
        notify: false,
      }).then(res => {
        this.tableData = res.data.list;
        this.total = res.data.total;
        this.cancel();
        this.cancelImportSite();
      });
      // 请求站点的所有标签
      this.API.findSiteTagByList({}, { notify: false }).then(res => {
        let existObj = this.formMap.find(item => item.key === 'siteTag');
        let importExistObj = this.importFormMap.find(item => item.key === 'siteTag');
        this.siteTagNameOptions = res.data.map(tagName => {
          return {
            label: tagName,
            value: tagName,
          };
        });
        if (existObj) existObj.selectOptions = [...this.siteTagNameOptions];
        if (importExistObj) importExistObj.selectOptions = [...this.siteTagNameOptions];
      });
    },

    // 请求栏目信息
    queryColumnData() {
      this.API.findColumnByList({}, { notify: false }).then(res => {
        this.columnOptions = res.data.map(item => {
          return {
            label: item.name,
            value: item._id,
          };
        });
        let importFormColumnItem = this.importFormMap.find(el => el.key === 'columnId');
        let formColumnItem = this.formMap.find(el => el.key === 'columnId');
        if (importFormColumnItem) importFormColumnItem.selectOptions = [...this.columnOptions];
        if (formColumnItem) formColumnItem.selectOptions = [...this.columnOptions];
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
      this.$nextTick(() => {
        this.initForm = this.LODASH.cloneDeep(this.form);
      });
    },

    handleAddMany() {
      this.showImport = true;
    },

    handleEdit(index, row) {
      this.show = true;
      this.mode = 'edit';
      this.$nextTick(async () => {
        let siteTag = [];
        let sitePin = [];
        let columnId = [];
        try {
          // 拓展数据处理
          let expand = JSON.parse(row.expand || '{}');
          siteTag = expand.tag || [];
          sitePin = expand.pin || [];
          let columnResult = await this.API.findSiteColmunByList({ siteId: row._id }, { notify: false });
          columnId = columnResult.data || [];
        } catch (err) {
          this.$tips('error', '初始化编辑数据异常', 'top-right', 2000);
        }
        // 整理编辑数据
        this.form = Object.assign(this.form, row, { siteTag, sitePin, columnId });
        // 保存编辑表单的初始值
        this.initForm = this.LODASH.cloneDeep(this.form);
      });
    },

    // 分页组件发生变化
    paginationChange() {
      this.queryData();
    },

    async save(form) {
      let params = { ...this.form };
      let needUnbind = [];
      let needBind = [];
      let needCreat = [];
      let needCreatedId = [];
      this.initForm.columnId.forEach(el => {
        if (params.columnId.indexOf(el) === -1) {
          // 原本有，现在无，即需要解除绑定的栏目
          needUnbind.push(el);
        }
      });
      params.columnId.forEach((el, index) => {
        if (this.initForm.columnId.indexOf(el) === -1) {
          let exist = this.columnOptions.find(item => {
            return item.value === el;
          });
          if (!exist) {
            // 现在有，选项无，即需要添加的栏目名称
            needCreat.push({
              name: el,
            });
            params.columnId.splice(index, 1);
          } else {
            // 现在有，原本无，即需要建立绑定的栏目
            needBind.push(el);
          }
        }
      });
      if (needCreat.length) {
        const columnResult = await this.API.addColumn({ data: needCreat }, { notify: false });
        needCreatedId = columnResult.data.map(item => item._id);
      }
      // 处理拓展字段
      let expand = JSON.parse(params.expand);
      expand = Object.prototype.toString.call(expand) === '[object Object]' ? expand : {};
      // 拼凑标签
      expand.tag = params.siteTag;
      expand.pin = params.sitePin;
      // 拼凑存储参数
      expand.columnStore = params.columnId.concat(needCreatedId);
      // 利用代码报错中断
      let newExpand = JSON.stringify(expand);
      params.expand = newExpand;
      // 添加/编辑站点数据
      let siteIds = [];
      if (this.mode === 'edit') {
        await this.API.updateSite(params);
        siteIds.push(params._id);
      } else if (this.mode === 'add') {
        delete params._id;
        delete params._v;
        let siteResult = await this.API.addSite(params);
        siteIds.push(siteResult.data[0]._id);
      }
      let columnIds = needBind.concat(needCreatedId);
      // 选择性绑定/解绑
      if (columnIds.length) {
        await this.API.bindSiteToColumn({ columnIds, siteIds }, { notify: false });
      }
      if (needUnbind.length) {
        await this.API.unbindSiteToColumn({ columnIds: needUnbind, siteIds }, { notify: false });
      }
      this.queryColumnData();
      this.queryData();
    },

    // 导入链接
    async saveImportSite() {
      let params = { ...this.importForm };
      try {
        let sites = JSON.parse(params.siteData);
        // 字段过滤
        sites = sites.map(item => {
          let { name, url, description } = item;
          return {
            name,
            url,
            description,
          };
        });

        sites.forEach(item => {
          if (params.siteTag.length) {
            // 忽略JSON数据中的tag数据
            let expand = {};
            expand.tag = params.siteTag;
            expand.columnStore = params.columnId.length ? [...params.columnId] : undefined;
            item.expand = JSON.stringify(expand);
          }
        });
        // 添加站点链接
        let siteResult = await this.API.addManySite({ sites });
        // 若选择栏目，则发送请求，绑定链接
        if (params.columnId.length) {
          let siteIds = siteResult.data.map(item => item._id);
          await this.API.bindSiteToColumn({ columnIds: params.columnId, siteIds }, { notify: false });
        }
        // 导入后刷新站点
        this.queryData();
      } catch (err) {
        this.$tips('error', '导入失败', 'top-right', 2000);
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
      this.initForm = null;
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
