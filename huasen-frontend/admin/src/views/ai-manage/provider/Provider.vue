<!--
 * @Autor: huasenjio
 * @Date: 2024-01-01 00:00:00
 * @LastEditors: huasenjio
 * @LastEditTime: 2024-01-01 00:00:00
 * @Description: AI 供应商管理
-->

<template>
  <div class="provider-manage">
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
      :title="mode == 'add' ? '添加供应商' : '编辑供应商'"
      :visible.sync="show"
      :formMap="formMap"
      :formData.sync="form"
      :formRule="rule"
      :close-on-click-modal="false"
      :mode="mode"
      :buttons="{ comfirm: '确 认', cancel: '取 消' }"
      @comfirmForm="save"
      @cancelForm="cancel"
      @onSelectChange="handleSelectChange"
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

const defaultExtraConfig = {
  defaultHeaders: {},
  defaultQuery: {},
  timeout: 180000,
  maxRetries: 0,
};

export default {
  name: 'ProviderManage',
  components: { TableList, DialogForm },
  data() {
    return {
      tableData: [],
      total: 0,
      tableMap: [
        { label: '供应商名称', key: 'name' },
        { label: '类型', key: 'providerType' },
        { label: 'baseUrl', key: 'baseUrl' },
        { label: '备注', key: 'remarks' },
        { label: '是否启用', key: 'enabled' },
      ],
      searchFormMap: [
        { label: '名称', type: 'input', key: 'name', value: '', show: true },
        {
          label: '类型',
          type: 'select',
          key: 'providerType',
          value: undefined,
          show: true,
          typeConfig: {
            options: [
              { label: '通义千问', value: 'qwen' }, // https://dashscope.aliyuncs.com/compatible-mode/v1
              { label: 'DeepSeek', value: 'deepseek' }, // https://api.deepseek.com
              { label: '月之暗面', value: 'kimi' }, // https://api.moonshot.cn/v1
              { label: '硅基流动', value: 'siliconflow' }, // https://dashscope.aliyuncs.com/compatible-mode/v1
              { label: 'CaMel', value: 'camel' }, // https://api.kr777.top/v1
              { label: '自定义', value: 'custom' }, // 自部署或其他兼容 OpenAI 协议的服务
            ],
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
        { label: '供应商名称', key: 'name', type: 'input' },
        {
          label: '供应商类型',
          key: 'providerType',
          type: 'select',
          typeConfig: {
            options: [
              { label: '通义千问', value: 'qwen' },
              { label: 'DeepSeek', value: 'deepseek' },
              { label: '月之暗面', value: 'kimi' },
              { label: '硅基流动', value: 'siliconflow' },
              { label: 'CaMel API', value: 'camel' },
              { label: '自定义', value: 'custom' },
            ],
          },
        },
        { label: 'Base URL', key: 'baseUrl', type: 'input' },
        { label: 'API Key', key: 'apiKey', type: 'input' },
        { label: '备注', key: 'remarks', type: 'input' },
        { label: '支持图片原生输入', key: 'supportsImageInput', type: 'switch', labelTip: '开启时，图片附件会按模型原生多模态输入发送；关闭时，仅把图片链接当作文本描述。' },
        {
          label: '支持文档解析输入',
          key: 'supportsDocumentInline',
          type: 'switch',
          labelTip: '开启时，系统会尝试解析 txt、md、pdf、docx、xlsx 等文件内容，并以文本方式发送给模型；关闭时，仅把文件链接当作文本描述。',
        },
        {
          label: '允许文本降级',
          key: 'supportsTextFallback',
          type: 'switch',
          labelTip: '开启时，当图片或文件无法按原生方式输入模型时，允许退化为 "附件名称 + 链接" 的文本描述继续发给模型；关闭时，缺少原生输入能力的附件会被直接拒绝。',
        },
        {
          label: '扩展配置 (JSON)',
          key: 'extraConfig',
          type: 'textarea',
        },
        { label: '是否启用', key: 'enabled', type: 'switch' },
      ],
      rule: {
        name: [{ validator: getElementFormValidator(['isNonEmpty::必填项']) }],
        providerType: [{ validator: getElementFormValidator(['isNonEmpty::必填项']) }],
        apiKey: [{ validator: getElementFormValidator(['isNonEmpty::必填项']) }],
        extraConfig: [{ validator: getElementFormValidator(['isNonEmpty::必填项', 'isJSONObject::请输入JSON对象（如："{}"）']) }],
      },
      form: {
        name: '',
        providerType: '',
        baseUrl: '',
        apiKey: '',
        remarks: '',
        supportsImageInput: false,
        supportsDocumentInline: false,
        supportsTextFallback: true,
        extraConfig: JSON.stringify(defaultExtraConfig, null, 2),
        enabled: true,
      },
      pageNo: 1,
      pageSize: 10,
      providerBaseUrlMap: {
        qwen: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        deepseek: 'https://api.deepseek.com',
        kimi: 'https://api.moonshot.cn/v1',
        siliconflow: 'https://api.siliconflow.cn/v1',
        camel: 'https://api.kr777.top/v1',
        custom: '',
      },
    };
  },
  activated() {
    this.init();
  },
  methods: {
    init() {
      this.queryData();
    },
    queryData() {
      let formData = this.$refs.tableList.getFormData();
      let params = Object.assign({ pageNo: this.pageNo, pageSize: this.pageSize }, formData);
      this.API.ai.findProviderByPage(params, { notify: false }).then(res => {
        this.tableData = res.data.list;
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
        const rawExtraConfig = row.extraConfig || JSON.stringify(defaultExtraConfig, null, 2);
        let parsedExtraConfig = defaultExtraConfig;
        try {
          parsedExtraConfig = Object.assign({}, defaultExtraConfig, JSON.parse(rawExtraConfig || '{}'));
        } catch (err) {
          parsedExtraConfig = defaultExtraConfig;
        }
        const legacyCaps = (parsedExtraConfig && parsedExtraConfig.capabilities) || {};
        const cleanExtraConfig = Object.assign({}, parsedExtraConfig);
        delete cleanExtraConfig.capabilities;
        this.form = Object.assign({}, row, {
          supportsImageInput: row.supportsImageInput !== undefined ? row.supportsImageInput : !!legacyCaps.supportsImageInput,
          supportsDocumentInline: row.supportsDocumentInline !== undefined ? row.supportsDocumentInline : !!legacyCaps.supportsDocumentInline,
          supportsTextFallback:
            row.supportsTextFallback !== undefined ? row.supportsTextFallback : legacyCaps.supportsTextFallback !== undefined ? !!legacyCaps.supportsTextFallback : true,
          extraConfig: JSON.stringify(cleanExtraConfig, null, 2),
        });
      });
    },
    handleRemove(index, row) {
      this.API.ai.removeProvider({ _id: row._id }).then(res => {
        this.queryData();
      });
    },
    handleRemoveMany(selection) {
      if (!selection || selection.length === 0) {
        this.$message.warning('请选择要删除的供应商');
        return;
      }
      const ids = selection.map(item => item._id);
      this.$confirm('删除供应商将同时删除关联的应用和预设，是否继续？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        const promises = ids.map(id => this.API.ai.removeProvider({ _id: id }));
        Promise.all(promises).then(() => {
          this.$message.success('批量删除成功');
          this.queryData();
        });
      });
    },
    save() {
      const params = { ...this.form };
      let parsedExtraConfig = defaultExtraConfig;
      try {
        parsedExtraConfig = Object.assign({}, defaultExtraConfig, JSON.parse(params.extraConfig || '{}'));
      } catch (err) {
        parsedExtraConfig = defaultExtraConfig;
      }
      delete parsedExtraConfig.capabilities;
      params.extraConfig = JSON.stringify(parsedExtraConfig);
      if (this.mode === 'edit') {
        this.API.ai.updateProvider(params).then(res => {
          this.queryData();
        });
      } else {
        delete params._id;
        this.API.ai.addProvider(params).then(res => {
          this.queryData();
        });
      }
    },
    cancel() {
      this.show = false;
    },
    handleSelectChange(key, value) {
      if (key === 'providerType' && this.providerBaseUrlMap[value] !== undefined) {
        this.form.baseUrl = this.providerBaseUrlMap[value];
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.provider-manage {
  width: 100%;
  height: 100%;
}
</style>
