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
      ref="tableList"
      :tableData="tableData"
      :tableMap="tableMap"
      :formMap="searchFormMap"
      :total="total"
      :showAdd="true"
      :showAddMany="true"
      :showSelection="true"
      :showDetail="true"
      @edit="handleEdit"
      @add="handleAdd"
      @detail="handleDetail"
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
    >
      <template v-slot:tips>
        <div class="text text-gray-500">
          <i class="el-icon-warning-outline text-orange-400"></i>
          温馨提示：添加的<font class="text-red-400">网链</font>需要配置关联到<font class="text-red-400">栏目</font>后才会被加载显示
        </div>
      </template>
    </DialogForm>
    <DialogForm
      v-if="showImport"
      ref="dialogImportForm"
      width="420"
      height="400"
      maxHeight="400"
      title="链接导入/出"
      :visible.sync="showImport"
      :formMap="importFormMap"
      :formData.sync="importForm"
      :formRule="importRule"
      :mode="importMode"
      :close-on-click-modal="false"
      @siteImportSuccess="handleSiteImportSuccess"
    ></DialogForm>
    <HsDialog
      v-if="showDetail"
      width="820"
      maxHeight="460"
      :title="`${LODASH.get(activeSite, 'name')}详情页`"
      :close-on-click-modal="false"
      :visible.sync="showDetail"
      :buttons="{ comfirm: '保 存' }"
      @close="handleCancel"
      @comfirmDialog="handleSaveDetail"
    >
      <MarkdownEditor :value.sync="currentSiteDetail" :onImgAdd="handleImgAddUrl"></MarkdownEditor>
    </HsDialog>
  </div>
</template>

<script>
import HsDialog from '@/components/common/dialog/Dialog.vue';
import TableList from '@/components/content/table-list/TableList.vue';
import DialogForm from '@/components/content/dialog-form/DialogForm.vue';
import MarkdownEditor from '@/components/content/markdown-editor/MarkdownEditor.vue';
import { Validator } from 'huasen-lib';
const validator = new Validator();
const getElementFormValidator = validator.getElementFormValidator.bind(validator);

export default {
  name: 'SiteManage',
  components: { HsDialog, TableList, DialogForm, MarkdownEditor },
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
          label: '访问量',
          key: 'pv',
          width: 64,
        },
        // {
        //   label: '备注',
        //   key: 'remarks',
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
          value: '',
          show: true,
        },
        {
          label: '链接',
          key: 'url',
          type: 'input',
          value: '',
          show: false,
        },
        {
          label: '描述',
          type: 'input',
          key: 'description',
          value: '',
          show: false,
        },
        {
          label: '备注',
          type: 'input',
          key: 'remarks',
          value: '',
          show: false,
        },
        {
          label: '标签',
          type: 'input',
          key: 'tag',
          value: '',
          show: false,
        },
        {
          label: '置顶标记',
          type: 'select',
          key: 'pin',
          value: undefined,
          typeConfig: {
            options: this.CONSTANT.dictionary.pin,
          },
          show: false,
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
      showImport: false,
      showDetail: false,
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
          typeConfig: {
            options: [],
            'allow-create': true,
            filterable: true,
            multiple: true,
          },
        },
        {
          label: '置顶标记',
          key: 'sitePin',
          type: 'select',
          typeConfig: {
            options: this.CONSTANT.dictionary.pin,
            filterable: true,
            multiple: true,
          },
        },
        {
          label: '所属栏目',
          key: 'columnId',
          type: 'select',
          typeConfig: {
            options: [],
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
        // {
        //   label: '拓展字段',
        //   key: 'expand',
        //   type: 'input',
        // },
      ],
      importFormMap: [
        {
          label: '所属栏目',
          key: 'columnId',
          type: 'select',
          typeConfig: {
            options: [],
            filterable: true,
            multiple: true,
          },
        },
        {
          label: '操作类型',
          key: 'siteInOut',
          type: 'siteInOut',
        },
      ],
      rule: {
        name: [
          {
            validator: getElementFormValidator(['isNonEmpty::必填项', 'minLength:2::长度不能小于2', 'maxLength:20::长度不能大于20']),
          },
        ],
        url: [{ validator: getElementFormValidator(['isNonEmpty::必填项', 'isUrl::请输入正确的网址']) }],
        expand: [{ validator: getElementFormValidator(['isNonEmpty::必填项', 'isJSONObject::请输入JSON对象']) }],
      },
      importRule: {},
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
      },
      initForm: null,
      pageNo: 1,
      pageSize: 10,

      siteTagNameOptions: [],
      columnOptions: [],
      activeSite: {},
      currentSiteDetail: '',
    };
  },

  activated() {
    this.queryData();
    this.queryColumnData();
  },

  mounted() {
    // this.queryData();
    // this.queryColumnData();
  },

  methods: {
    queryData() {
      // 获取搜索表单数据
      let formData = this.$refs.tableList.getFormData();
      let params = Object.assign(
        {
          pageNo: this.pageNo,
          pageSize: this.pageSize,
        },
        formData,
      );
      // 请求站点数据
      this.API.site
        .findSiteByPage(params, {
          notify: false,
        })
        .then(res => {
          this.tableData = res.data.list;
          this.total = res.data.total;
          this.cancel();
        });
      // 请求站点的所有标签
      this.API.site.findSiteTagByList({}, { notify: false }).then(res => {
        let existObj = this.formMap.find(item => item.key === 'siteTag');
        let importExistObj = this.importFormMap.find(item => item.key === 'siteTag');
        this.siteTagNameOptions = res.data.map(tagName => {
          return {
            label: tagName,
            value: tagName,
          };
        });
        if (existObj) existObj.typeConfig.options = [...this.siteTagNameOptions];
        if (importExistObj) importExistObj.typeConfig.options = [...this.siteTagNameOptions];
      });
    },

    // 请求栏目信息
    queryColumnData() {
      this.API.column.findColumnByList({}, { notify: false }).then(res => {
        this.columnOptions = res.data.map(item => {
          return {
            label: item.name,
            value: item._id,
          };
        });
        let importFormColumnItem = this.importFormMap.find(el => el.key === 'columnId');
        let formColumnItem = this.formMap.find(el => el.key === 'columnId');
        if (importFormColumnItem) importFormColumnItem.typeConfig.options = [...this.columnOptions];
        if (formColumnItem) formColumnItem.typeConfig.options = [...this.columnOptions];
      });
    },

    updatePagination(pageNo, pageSize) {
      this.pageNo = pageNo;
      this.pageSize = pageSize;
    },

    handleSiteImportSuccess() {
      this.queryData();
      this.queryColumnData();
    },

    handleRemove(index, row) {
      this.API.site.removeSite({ _id: row._id }).then(res => {
        this.queryData();
      });
    },

    handleRemoveMany(list) {
      let _ids = list.map(item => item._id);
      this.API.site.removeManySite({ _ids }).then(res => {
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

    handleDetail(index, row) {
      this.API.site
        .findSiteDetail({ _id: row._id }, { notify: false })
        .then(res => {
          this.activeSite = res.data;
          this.currentSiteDetail = this.LODASH.get(res.data, 'detail', '');
          this.$nextTick(() => {
            this.showDetail = true;
          });
        })
        .catch(err => {});
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
          let columnResult = await this.API.site.findSiteColmunByList({ siteId: row._id }, { notify: false });
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
        const columnResult = await this.API.column.addColumn({ data: needCreat }, { notify: false });
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
        await this.API.site.updateSite(params);
        siteIds.push(params._id);
      } else if (this.mode === 'add') {
        delete params._id;
        delete params._v;
        let siteResult = await this.API.site.addSite(params);
        siteIds.push(siteResult.data[0]._id);
      }

      let columnIds = needBind.concat(needCreatedId);
      // 绑定网站链接到栏目
      if (columnIds.length) {
        await this.API.column.bindSiteToColumn({ columnIds, siteIds }, { notify: false });
      }
      // 从栏目解绑链接
      if (needUnbind.length) {
        await this.API.column.unbindSiteToColumn({ columnIds: needUnbind, siteIds }, { notify: false });
      }
      // 从新请求网址链接和栏目数据
      this.queryColumnData();
      this.queryData();
    },

    cancel() {
      if (this.$refs.dialogForm) {
        this.$refs.dialogForm.close();
      }
      this.show = false;
      this.initForm = null;
    },

    /**
     * 取消或重置详情页
     */
    handleCancel() {
      this.showDetail = false;
      this.activeSite = null;
      this.currentSiteDetail = '';
    },

    /**
     * 保存详情页
     */
    handleSaveDetail() {
      this.API.site.updateSite({ _id: this.activeSite._id, detail: this.currentSiteDetail }, { notify: false }).then(res => {
        this.$tips('success', '网链详情页保存成功', 'top-right', 1200);
        this.activeSite.detail = this.currentSiteDetail;
        this.handleCancel();

        this.$nextTick(() => {
          this.queryData();
        });
      });
    },

    /**
     * 处理详情页图片上传
     * @param {*} index
     * @param {*} file
     */
    async handleImgAddUrl(index, file) {
      let formdata = new FormData();
      formdata.append('file', file);
      let result = await this.API.file.uploadFile(formdata, {
        url: '/file/upload?type=article',
      });
      this.$tips('success', '上传成功', 'top-right', 1200);
      // 返回url写入内容
      return location.origin + location.pathname + result.data[0].path;
    },
  },
};
</script>

<style lang="scss" scoped>
.site-manage {
  width: 100%;
  height: 100%;
  padding: 10px 10px;
  ::v-deep .h-markdown-editor {
    width: 100%;
    height: 100%;
    margin: 0 auto;
    .markdown-editor {
      height: 430px;
    }
  }
}
</style>
