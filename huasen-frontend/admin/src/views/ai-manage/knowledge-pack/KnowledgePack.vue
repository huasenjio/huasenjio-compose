<!--
 * @Autor: huasenjio
 * @Date: 2026-05-28 00:00:00
 * @LastEditors: huasenjio
 * @LastEditTime: 2026-05-28 00:00:00
 * @Description: AI 知识包管理
-->

<template>
  <div class="knowledge-pack-manage">
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
      width="520"
      :title="mode == 'add' ? '添加知识包' : '编辑知识包'"
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
import { Validator } from 'huasen-lib';
const validator = new Validator();
const getElementFormValidator = validator.getElementFormValidator.bind(validator);

function getDefaultForm() {
  return {
    name: '',
    description: '',
    appIds: [],
    articleIds: [],
    code: 0,
    maxArticles: 5,
    maxKnowledgeChars: 100000,
    enabled: true,
  };
}

export default {
  name: 'KnowledgePackManage',
  components: { TableList, DialogForm },
  data() {
    return {
      tableData: [],
      total: 0,
      apps: [],
      articles: [],
      tableMap: [
        { label: '知识包名称', key: 'name' },
        { label: '可用应用', key: 'appText' },
        { label: '绑定文章', key: 'articleText' },
        { label: '权限码', key: 'code', width: 90 },
        { label: '是否启用', key: 'enabled', width: 90 },
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
      formMap: [
        { label: '知识包名称', key: 'name', type: 'input' },
        { label: '描述', key: 'description', type: 'textarea' },
        {
          label: '可用AI应用',
          key: 'appIds',
          type: 'select',
          labelTip: '不选择表示对所有满足权限的AI应用开放',
          typeConfig: { options: [], multiple: true, filterable: true, clearable: true, 'multiple-limit': 100 },
        },
        {
          label: '绑定文章',
          key: 'articleIds',
          type: 'select',
          typeConfig: { options: [], multiple: true, filterable: true, clearable: true, 'multiple-limit': 100 },
        },
        {
          label: '权限码',
          key: 'code',
          type: 'select',
          typeConfig: { options: this.CONSTANT.dictionary.code },
        },
        { label: '单次最多注入文章数', key: 'maxArticles', type: 'number' },
        { label: '最大知识字符数', key: 'maxKnowledgeChars', type: 'number' },
        { label: '是否启用', key: 'enabled', type: 'switch' },
      ],
      rule: {
        name: [{ validator: getElementFormValidator(['isNonEmpty::必填项', 'minLength:2::长度小于2', 'maxLength:50::长度大于50']) }],
      },
      form: getDefaultForm(),
      show: false,
      mode: 'add',
      pageNo: 1,
      pageSize: 10,
    };
  },
  activated() {
    this.init();
  },
  methods: {
    init() {
      Promise.all([this.refreshAppOptions(), this.refreshArticleOptions()]).then(() => {
        this.queryData();
      });
    },
    refreshAppOptions() {
      return this.API.ai.findAppByList({ enabled: true }, { notify: false }).then(res => {
        this.apps = res.data || [];
        const target = this.formMap.find(item => item.key === 'appIds');
        if (target) {
          target.typeConfig.options = this.apps.map(item => ({
            label: item.name,
            value: item._id,
          }));
        }
      });
    },
    refreshArticleOptions() {
      return this.API.article.findArticleByPage({ pageNo: 1, pageSize: 200, isDraft: false }, { notify: false }).then(res => {
        this.articles = (res.data && res.data.list) || [];
        const target = this.formMap.find(item => item.key === 'articleIds');
        if (target) {
          target.typeConfig.options = this.articles.map(item => ({
            label: item.title,
            value: item._id,
          }));
        }
      });
    },
    queryData() {
      let formData = this.$refs.tableList.getFormData();
      let params = Object.assign({ pageNo: this.pageNo, pageSize: this.pageSize }, formData);
      this.API.ai.findKnowledgePackByPage(params, { notify: false }).then(res => {
        const list = res.data.list || [];
        this.tableData = list.map(item => {
          const appNames = item.appNames || [];
          const articleTitles = item.articleTitles || [];
          return {
            ...item,
            appText: appNames.length ? appNames.join('、') : '全部AI应用',
            articleText: articleTitles.join('、'),
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
      this.form = getDefaultForm();
      this.show = true;
      this.mode = 'add';
    },
    handleEdit(index, row) {
      this.show = true;
      this.mode = 'edit';
      this.$nextTick(() => {
        this.form = Object.assign(getDefaultForm(), row, {
          appIds: Array.isArray(row.appIds) ? [].concat(row.appIds) : [],
          articleIds: Array.isArray(row.articleIds) ? [].concat(row.articleIds) : [],
        });
      });
    },
    handleRemove(index, row) {
      this.API.ai.removeKnowledgePack({ _id: row._id }).then(() => {
        this.queryData();
      });
    },
    handleRemoveMany(selection) {
      if (!selection || selection.length === 0) {
        this.$message.warning('请选择要删除的知识包');
        return;
      }
      const ids = selection.map(item => item._id);
      this.$confirm('确定删除选中的知识包吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        const promises = ids.map(id => this.API.ai.removeKnowledgePack({ _id: id }));
        Promise.all(promises).then(() => {
          this.$message.success('批量删除成功');
          this.queryData();
        });
      });
    },
    save() {
      const params = { ...this.form };
      if (this.mode === 'edit') {
        this.API.ai.updateKnowledgePack(params).then(() => {
          this.queryData();
        });
      } else {
        delete params._id;
        this.API.ai.addKnowledgePack(params).then(() => {
          this.queryData();
        });
      }
    },
    cancel() {
      this.show = false;
      this.form = getDefaultForm();
    },
  },
};
</script>

<style lang="scss" scoped>
.knowledge-pack-manage {
  width: 100%;
  height: 100%;
}
.knowledge-pack-tip {
  color: var(--gray-500);
  font-size: 12px;
  line-height: 18px;
  margin-bottom: 8px;
}
</style>
