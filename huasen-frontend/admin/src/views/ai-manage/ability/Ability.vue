<!--
 * @Autor: huasenjio
 * @Date: 2026-04-28 00:00:00
 * @LastEditors: huasenjio
 * @LastEditTime: 2026-04-28 00:00:00
 * @Description: AI 插件能力管理（开源版仅支持编辑部分字段）
-->

<template>
  <div class="ability-manage">
    <TableList
      ref="tableList"
      :tableData="tableData"
      :tableMap="tableMap"
      :formMap="searchFormMap"
      :total="total"
      :showAdd="hasClosedSource"
      :showEdit="true"
      :showSelection="hasClosedSource"
      :showRemoveMany="hasClosedSource"
      @add="handleAdd"
      @edit="handleEdit"
      @remove="handleRemove"
      @removeMany="handleRemoveMany"
      @search="queryData"
      @paginationChange="paginationChange"
      @updatePagination="updatePagination"
    ></TableList>
    <DialogForm
      v-if="show"
      ref="dialogForm"
      width="480"
      :title="mode == 'add' ? '添加AI能力' : '编辑AI能力'"
      :visible.sync="show"
      :formMap="currentFormMap"
      :formData.sync="form"
      :formRule="rule"
      :close-on-click-modal="false"
      :mode="mode"
      :buttons="{ comfirm: '确 认', cancel: '取 消' }"
      @comfirmForm="save"
      @cancelForm="cancel"
    >
    </DialogForm>
  </div>
</template>

<script>
import TableList from '@/components/content/table-list/TableList.vue';
import DialogForm from '@/components/content/dialog-form/DialogForm.vue';
import { Validator } from 'huasen-lib';
const validator = new Validator();
const getElementFormValidator = validator.getElementFormValidator.bind(validator);

const RESPONSE_FORMAT_OPTIONS = [
  { label: 'JSON 对象', value: 'json_object' },
  { label: '纯文本', value: 'text' },
];

export default {
  name: 'AbilityManage',
  components: { TableList, DialogForm },
  data() {
    return {
      tableData: [],
      total: 0,
      tableMap: [
        { label: '能力标识', key: 'abilityCode' },
        { label: '能力名称', key: 'name' },
        { label: '图标', key: 'icon' },
        { label: '绑定应用', key: 'appId' },
        { label: '响应格式', key: 'defaultResponseFormat' },
        { label: '是否启用', key: 'enabled' },
        { label: '权限码', key: 'code' },
      ],
      searchFormMap: [
        { label: '能力名称', type: 'input', key: 'name', value: '', show: true },
        {
          label: '是否启用',
          type: 'select',
          key: 'enabled',
          value: undefined,
          show: false,
          typeConfig: {
            options: [
              { label: '启用', value: true },
              { label: '禁用', value: false },
            ],
          },
        },
      ],
      show: false,
      mode: 'add',
      appOptions: [],
      formMap: this.buildFormMap(false),
      rule: {
        abilityCode: [{ validator: getElementFormValidator(['isNonEmpty::必填项']) }],
        name: [{ validator: getElementFormValidator(['isNonEmpty::必填项']) }],
        appId: [{ validator: getElementFormValidator(['isNonEmpty::必填项']) }],
      },
      form: {
        abilityCode: '',
        name: '',
        icon: '',
        appId: '',
        defaultResponseFormat: 'json_object',
        defaultPrompt: '',
        enabled: true,
        code: 0,
      },
      pageNo: 1,
      pageSize: 10,
    };
  },
  computed: {
    hasClosedSource() {
      return !!(this.API.ai.addAbility && this.API.ai.removeAbility);
    },
    currentFormMap() {
      return this.buildFormMap(this.mode === 'add');
    },
  },
  activated() {
    this.init();
  },
  methods: {
    init() {
      this.loadApps();
      this.queryData();
    },
    loadApps() {
      this.API.ai.findAppByList({}, { notify: false }).then(res => {
        this.appOptions = (res.data || []).map(item => ({
          label: item.name,
          value: item._id,
        }));
      });
    },
    buildFormMap(isAdd) {
      const limitedEdit = !this.hasClosedSource;
      const maps = [
        {
          label: '能力标识',
          key: 'abilityCode',
          type: 'input',
          editDisabled: limitedEdit,
          typeConfig: { placeholder: '例如：site-smart-fill' },
        },
        {
          label: '能力名称',
          key: 'name',
          type: 'input',
          editDisabled: limitedEdit,
          typeConfig: { placeholder: '例如：智能填充站点信息' },
        },
        {
          label: '图标',
          key: 'icon',
          type: 'input',
          editDisabled: limitedEdit,
          typeConfig: { placeholder: 'Element 图标类名或图片 URL' },
        },
        {
          label: '绑定AI应用',
          key: 'appId',
          type: 'select',
          typeConfig: { options: this.appOptions },
        },
        {
          label: '默认响应格式',
          key: 'defaultResponseFormat',
          type: 'select',
          typeConfig: { options: RESPONSE_FORMAT_OPTIONS },
        },
        {
          label: '默认提示词',
          key: 'defaultPrompt',
          type: 'textarea',
        },
        {
          label: '是否启用',
          key: 'enabled',
          type: 'switch',
          disabled: limitedEdit,
        },
        {
          label: '权限码',
          key: 'code',
          type: 'number',
          editDisabled: limitedEdit,
        },
      ];
      return maps;
    },
    queryData() {
      let formData = this.$refs.tableList.getFormData();
      let params = Object.assign({ pageNo: this.pageNo, pageSize: this.pageSize }, formData);
      this.API.ai.findAbilityByPage(params, { notify: false }).then(res => {
        this.tableData = res.data.list || [];
        this.total = res.data.total;
        this.cancel();
      });
    },
    updatePagination(pageNo, pageSize) {
      this.pageNo = pageNo;
      this.pageSize = pageSize;
    },
    paginationChange() {
      this.queryData();
    },
    handleAdd() {
      this.form = this.getDefaultForm();
      this.show = true;
      this.mode = 'add';
    },
    handleEdit(index, row) {
      this.show = true;
      this.mode = 'edit';
      this.$nextTick(() => {
        this.form = Object.assign({}, row);
      });
    },
    handleRemove(index, row) {
      this.API.ai.removeAbility({ _id: row._id }).then(() => {
        this.queryData();
      });
    },
    handleRemoveMany(selection) {
      if (!selection || selection.length === 0) {
        this.$message.warning('请选择要删除的能力');
        return;
      }
      this.$confirm('确认删除所选能力？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        const promises = selection.map(item => this.API.ai.removeAbility({ _id: item._id }));
        Promise.all(promises).then(() => {
          this.$message.success('批量删除成功');
          this.queryData();
        });
      });
    },
    save() {
      const params = { ...this.form };
      if (this.mode === 'edit') {
        this.API.ai.updateAbility(params).then(() => {
          this.queryData();
        });
      } else {
        delete params._id;
        this.API.ai.addAbility(params).then(() => {
          this.queryData();
        });
      }
    },
    cancel() {
      this.show = false;
    },
    getDefaultForm() {
      return {
        abilityCode: '',
        name: '',
        icon: '',
        appId: '',
        defaultResponseFormat: 'json_object',
        defaultPrompt: '',
        enabled: true,
        code: 0,
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.ability-manage {
  width: 100%;
  height: 100%;
}
</style>
