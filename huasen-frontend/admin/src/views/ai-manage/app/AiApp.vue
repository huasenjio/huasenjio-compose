<!--
 * @Autor: huasenjio
 * @Date: 2024-01-01 00:00:00
 * @LastEditors: huasenjio
 * @LastEditTime: 2024-01-01 00:00:00
 * @Description: AI应用管理
-->

<template>
  <div class="aiapp-manage">
    <TableList
      ref="tableList"
      :tableData="tableData"
      :tableMap="tableMap"
      :formMap="searchFormMap"
      :total="total"
      :showAdd="true"
      :showEdit="true"
      :showSelection="true"
      :showRemoveMany="true"
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
      :title="mode == 'add' ? '添加AI应用' : '编辑AI应用'"
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
    </DialogForm>
  </div>
</template>

<script>
import TableList from '@/components/content/table-list/TableList.vue';
import DialogForm from '@/components/content/dialog-form/DialogForm.vue';
import { Validator } from 'huasen-lib';
const validator = new Validator();
const getElementFormValidator = validator.getElementFormValidator.bind(validator);

export default {
  name: 'AiAppManage',
  components: { TableList, DialogForm },
  data() {
    return {
      tableData: [],
      total: 0,
      tableMap: [
        { label: '应用名称', key: 'name' },
        { label: '供应商', key: 'providerName' },
        { label: '模型预设', key: 'presetName' },
        { label: '权限码', key: 'code' },
        { label: '是否启用', key: 'enabled' },
        { label: '展示序号', key: 'sort' },
      ],
      searchFormMap: [
        { label: '名称', type: 'input', key: 'name', value: '', show: true },
        {
          label: '权限码',
          type: 'select',
          key: 'code',
          value: undefined,
          show: true,
          typeConfig: {
            options: this.CONSTANT.dictionary.code,
          },
        },
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
      formMap: [
        { label: '应用名称', key: 'name', type: 'input' },
        { label: '描述', key: 'description', type: 'input' },
        { label: '应用图标', key: 'icon', type: 'imgURL', typeConfig: { uploadType: 'icon', accept: '.png,.jpg,.jpeg,.svg,.webp' } },
        {
          label: '供应商',
          key: 'providerId',
          type: 'select',
          typeConfig: { options: [], filterable: true, clearable: true },
        },
        {
          label: '模型预设',
          key: 'presetId',
          type: 'select',
          typeConfig: { options: [], filterable: true, clearable: true },
        },
        { label: '欢迎语', key: 'welcomeText', type: 'input' },
        {
          label: '权限码',
          key: 'code',
          type: 'select',
          typeConfig: {
            options: this.CONSTANT.dictionary.code,
          },
        },
        { label: '展示序号（越大越靠前）', key: 'sort', type: 'number' },
        { label: '是否启用', key: 'enabled', type: 'switch' },
      ],
      rule: {
        name: [{ validator: getElementFormValidator(['isNonEmpty::必填项', 'minLength:2::长度小于2', 'maxLength:50::长度大于50']) }],
      },
      form: {
        name: '',
        description: '',
        icon: '',
        providerId: '',
        presetId: '',
        welcomeText: '',
        code: 0,
        enabled: true,
        sort: 0,
      },
      pageNo: 1,
      pageSize: 10,
      providers: [],
      presets: [],
      allPresets: [],
    };
  },
  activated() {
    this.init();
  },
  methods: {
    init() {
      Promise.all([this.refreshProviderOptions(), this.refreshPresetOptions()]).then(() => {
        this.queryData();
      });
    },
    refreshProviderOptions() {
      return this.API.ai.findProviderByList({ enabled: true }, { notify: false }).then(res => {
        this.providers = res.data || [];
        const target = this.formMap.find(item => item.key === 'providerId');
        if (target) {
          target.typeConfig.options = this.providers.map(item => ({
            label: item.name,
            value: item._id,
          }));
        }
      });
    },
    refreshPresetOptions(appId) {
      const params = { enabled: true };
      if (appId) params.appId = appId;
      return this.API.ai.findPresetByList(params, { notify: false }).then(res => {
        this.presets = res.data || [];
        if (!appId) {
          this.allPresets = this.presets;
        }
        const target = this.formMap.find(item => item.key === 'presetId');
        if (target) {
          target.typeConfig.options = this.presets.map(item => ({
            label: item.name,
            value: item._id,
          }));
        }
      });
    },
    queryData() {
      let formData = this.$refs.tableList.getFormData();
      let params = Object.assign({ pageNo: this.pageNo, pageSize: this.pageSize }, formData);
      this.API.ai.findAppByPage(params, { notify: false }).then(res => {
        const list = res.data.list || [];
        this.tableData = list.map(item => {
          const provider = this.providers.find(p => String(p._id) === String(item.providerId));
          const preset = this.allPresets.find(p => String(p._id) === String(item.presetId));
          return {
            ...item,
            providerName: provider ? provider.name : item.providerId,
            presetName: preset ? preset.name : item.presetId,
          };
        });
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
      this.show = true;
      this.mode = 'add';
      this.refreshPresetOptions();
    },
    handleEdit(index, row) {
      this.show = true;
      this.mode = 'edit';
      this.refreshPresetOptions(row._id);
      this.$nextTick(() => {
        this.form = Object.assign({ presetId: row.presetId || '' }, row);
      });
    },
    handleRemove(index, row) {
      this.API.ai.removeApp({ _id: row._id }).then(res => {
        this.queryData();
      });
    },
    handleRemoveMany(selection) {
      if (!selection || selection.length === 0) {
        this.$message.warning('请选择要删除的应用');
        return;
      }
      const ids = selection.map(item => item._id);
      this.$confirm('删除应用将同时删除关联的模型预设，是否继续？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        const promises = ids.map(id => this.API.ai.removeApp({ _id: id }));
        Promise.all(promises).then(() => {
          this.$message.success('批量删除成功');
          this.queryData();
        });
      });
    },
    save() {
      const params = { ...this.form };
      if (this.mode === 'edit') {
        this.API.ai.updateApp(params).then(res => {
          this.queryData();
        });
      } else {
        delete params._id;
        this.API.ai.addApp(params).then(res => {
          this.queryData();
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
.aiapp-manage {
  width: 100%;
  height: 100%;
}
</style>
