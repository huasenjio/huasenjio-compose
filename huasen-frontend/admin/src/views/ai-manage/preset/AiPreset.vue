<!--
 * @Autor: huasenjio
 * @Date: 2024-01-01 00:00:00
 * @LastEditors: huasenjio
 * @LastEditTime: 2024-01-01 00:00:00
 * @Description: AI 模型预设管理
-->

<template>
  <div class="aipreset-manage">
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
      :title="mode == 'add' ? '添加模型预设' : '编辑模型预设'"
      :visible.sync="show"
      :formMap="computedFormMap"
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
  name: 'AiPresetManage',
  components: { TableList, DialogForm },
  data() {
    return {
      tableData: [],
      total: 0,
      imageTypeOptions: [],
      fileTypeOptions: [],
      tableMap: [
        { label: '预设名称', key: 'name' },
        { label: '模型', key: 'model' },
        { label: '应用', key: 'appName' },
        { label: '供应商', key: 'providerName' },
        { label: '是否启用', key: 'enabled' },
      ],
      searchFormMap: [
        { label: '名称', type: 'input', key: 'name', value: '', show: true },
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
        { label: '预设名称', key: 'name', type: 'input' },
        {
          label: '所属应用',
          key: 'appId',
          type: 'select',
          typeConfig: { options: [], filterable: true },
        },
        {
          label: '供应商',
          key: 'providerId',
          type: 'select',
          typeConfig: { options: [], filterable: true },
        },
        { label: '模型名称', key: 'model', type: 'input' },
        {
          label: '提示词模板',
          key: 'promptTemplate',
          type: 'textarea',
        },
        { label: 'temperature（采样温度）', key: 'temperature', type: 'slider', typeConfig: { min: 0, max: 2, step: 0.1, showInput: true } },
        { label: 'top_p（核采样）', key: 'topP', type: 'slider', typeConfig: { min: 0, max: 1, step: 0.1, showInput: true } },
        { label: '允许上传图片', key: 'allowImage', type: 'switch' },
        { label: '图片以 Base64 发送', key: 'imageAsBase64', type: 'switch', labelTip: '开启图片以 Base64 编码发送给模型，避免供应商服务器无法访问 URL 资源的情况。' },
        { label: '允许上传文件', key: 'allowFile', type: 'switch' },
        { label: '最大输出长度（单位：K）', key: 'maxTokens', type: 'number' },
        { label: '上下文长度（单位：条）', key: 'maxContextMessages', type: 'number' },
        {
          label: '模型参数 (JSON)',
          key: 'params',
          type: 'textarea',
          typeConfig: { placeholder: '{"presence_penalty": -2~2, "frequency_penalty": -2~2, "stop": ["结束词"], "seed": 42, "response_format": "json_object"}' },
        },
        { label: '是否启用', key: 'enabled', type: 'switch' },
      ],
      rule: {
        name: [{ validator: getElementFormValidator(['isNonEmpty::必填项', 'minLength:2::长度小于2', 'maxLength:50::长度大于50']) }],
        model: [{ validator: getElementFormValidator(['isNonEmpty::必填项']) }],
        params: [{ validator: getElementFormValidator(['isNonEmpty::必填项', 'isJSONObject::请输入JSON对象（如："{}"）']) }],
      },
      form: {
        name: '',
        appId: '',
        providerId: '',
        model: '',
        promptTemplate: '',
        temperature: 0.7,
        maxTokens: 2048,
        topP: 1,
        params: '{}',
        allowImage: false,
        acceptImageTypes: [],
        imageAsBase64: false,
        allowFile: false,
        acceptFileTypes: [],
        maxContextMessages: 128,
        enabled: true,
      },
      pageNo: 1,
      pageSize: 10,
      apps: [],
      providers: [],
    };
  },
  computed: {
    // 动态计算 formMap，根据 allowImage/allowFile 状态插入多选框
    computedFormMap() {
      var baseMap = this.formMap.slice();
      var allowImageIndex = baseMap.findIndex(function (item) {
        return item.key === 'allowImage';
      });
      var allowFileIndex = baseMap.findIndex(function (item) {
        return item.key === 'allowFile';
      });

      // 在 allowImage 后插入图片类型多选（仅当 allowImage 为 true 时显示）
      if (allowImageIndex !== -1 && this.form.allowImage) {
        baseMap.splice(allowImageIndex + 1, 0, {
          key: 'acceptImageTypes',
          type: 'select',
          typeConfig: {
            options: this.imageTypeOptions,
            multiple: true,
            filterable: true,
            placeholder: '不选择 = 允许全部图片类型',
            clearable: true,
          },
        });
      }

      // 在 allowFile 后插入文件类型多选（仅当 allowFile 为 true 时显示）
      if (allowFileIndex !== -1 && this.form.allowFile) {
        // 需要重新查找 allowFile 的索引，因为前面可能插入了图片类型
        var updatedAllowFileIndex = baseMap.findIndex(function (item) {
          return item.key === 'allowFile';
        });
        baseMap.splice(updatedAllowFileIndex + 1, 0, {
          key: 'acceptFileTypes',
          type: 'select',
          typeConfig: {
            options: this.fileTypeOptions,
            multiple: true,
            filterable: true,
            placeholder: '不选择 = 允许全部文件类型',
            clearable: true,
          },
        });
      }

      return baseMap;
    },
  },
  activated() {
    this.init();
  },
  methods: {
    init() {
      this.loadAcceptTypes();
      this.refreshAppOptions();
      this.refreshProviderOptions();
      this.queryData();
    },
    loadAcceptTypes() {
      this.API.ai.getAcceptTypes({}, { notify: false }).then(res => {
        var acceptTypes = res.data || {};
        var imageTypes = [];
        var fileTypes = [];
        Object.keys(acceptTypes).forEach(function (ext) {
          var mime = acceptTypes[ext] || '';
          if (mime.indexOf('image/') === 0) {
            imageTypes.push({ label: ext, value: ext });
          } else {
            fileTypes.push({ label: ext, value: ext });
          }
        });
        this.imageTypeOptions = imageTypes;
        this.fileTypeOptions = fileTypes;
      });
    },
    refreshAppOptions() {
      this.API.ai.findAppByList({ enabled: true }, { notify: false }).then(res => {
        this.apps = res.data || [];
        const target = this.formMap.find(item => item.key === 'appId');
        if (target) {
          target.typeConfig.options = this.apps.map(item => ({
            label: item.name,
            value: item._id,
          }));
        }
      });
    },
    refreshProviderOptions() {
      this.API.ai.findProviderByList({ enabled: true }, { notify: false }).then(res => {
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
    queryData() {
      let formData = this.$refs.tableList.getFormData();
      let params = Object.assign({ pageNo: this.pageNo, pageSize: this.pageSize }, formData);
      this.API.ai.findPresetByPage(params, { notify: false }).then(res => {
        const list = res.data.list || [];
        this.tableData = list.map(item => {
          const app = this.apps.find(a => String(a._id) === String(item.appId));
          const provider = this.providers.find(p => String(p._id) === String(item.providerId));
          return {
            ...item,
            appName: app ? app.name : item.appId,
            providerName: provider ? provider.name : item.providerId,
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
    },
    handleEdit(index, row) {
      this.show = true;
      this.mode = 'edit';
      this.$nextTick(() => {
        this.form = Object.assign({}, row, {
          acceptImageTypes: Array.isArray(row.acceptImageTypes) ? [].concat(row.acceptImageTypes) : [],
          acceptFileTypes: Array.isArray(row.acceptFileTypes) ? [].concat(row.acceptFileTypes) : [],
        });
      });
    },
    handleRemove(index, row) {
      this.API.ai.removePreset({ _id: row._id }).then(res => {
        this.queryData();
      });
    },
    handleRemoveMany(selection) {
      if (!selection || selection.length === 0) {
        this.$message.warning('请选择要删除的预设');
        return;
      }
      const ids = selection.map(item => item._id);
      this.$confirm('确定删除选中的预设吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        const promises = ids.map(id => this.API.ai.removePreset({ _id: id }));
        Promise.all(promises).then(() => {
          this.$message.success('批量删除成功');
          this.queryData();
        });
      });
    },
    save() {
      const params = { ...this.form };
      if (this.mode === 'edit') {
        this.API.ai.updatePreset(params).then(res => {
          this.queryData();
        });
      } else {
        delete params._id;
        this.API.ai.addPreset(params).then(res => {
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
.aipreset-manage {
  width: 100%;
  height: 100%;
}
</style>
