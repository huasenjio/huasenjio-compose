<!--
 * @Autor: huasenjio
 * @Date: 2023-04-13 00:20:47
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-04-13 00:20:47
 * @Description: 标签管理
-->

<template>
  <div class="tag-manage">
    <TableList
      ref="tableList"
      :tableData="tags"
      :tableMap="tableMap"
      :formMap="searchFormMap"
      :showAdd="true"
      :showEdit="true"
      :showSelection="true"
      :showRemoveMany="true"
      :total="total"
      @add="addTag"
      @edit="editTag"
      @remove="removeTag"
      @removeMany="removeManyTags"
      @search="queryTag"
      @paginationChange="paginationChange"
      @updatePagination="updatePagination"
    ></TableList>
    <DialogForm
      v-if="show"
      ref="dialogForm"
      width="460"
      height="180"
      :title="mode == 'add' ? '添加标签' : '编辑标签'"
      :visible.sync="show"
      :mode="mode"
      :close-on-click-modal="false"
      :buttons="{ comfirm: '确 认', cancel: '取 消' }"
      :formMap="formMap"
      :formData.sync="form"
      :formRule="rule"
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
export default {
  name: 'TagManage',
  components: { TableList, DialogForm },
  data() {
    return {
      // 表格相关
      tags: [],
      tableMap: [
        {
          label: '标签名称',
          key: 'name',
        },
      ],
      total: 0,

      // 搜索表单
      searchFormMap: [
        {
          label: '名称',
          type: 'input',
          key: 'name',
          show: true,
        },
      ],

      // 添加编辑表单
      show: false,
      mode: 'add',
      formMap: [
        {
          label: '标签名称',
          key: 'name',
          type: 'input',
        },
      ],

      rule: {
        name: [{ validator: getElementFormValidator(['isNonEmpty::必填项']) }],
      },

      form: {
        name: '',
      },

      pageNo: 1,
      pageSize: 10,
    };
  },
  mounted() {
    // this.init()
  },
  activated() {
    this.init();
  },
  methods: {
    init() {
      this.queryTag();
    },
    queryTag() {
      let formData = this.$refs.tableList.getFormData();
      let params = Object.assign(
        {
          pageNo: this.pageNo,
          pageSize: this.pageSize,
        },
        formData,
      );
      this.API.tag
        .findByPage(params, {
          notify: false,
        })
        .then(res => {
          this.tags = res.data.list;
          this.total = res.data.total;
          this.cancel();
        });
    },

    updatePagination(pageNo, pageSize) {
      this.pageNo = pageNo;
      this.pageSize = pageSize;
    },

    removeTag(index, row) {
      this.API.tag.removeTag({ _id: row._id }).then(res => {
        this.queryTag();
      });
    },
    removeManyTags(selection) {
      if (!selection || selection.length === 0) {
        this.$message.warning('请选择要删除的标签');
        return;
      }
      const ids = selection.map(item => item._id);
      this.API.tag
        .removeManyTags({ ids })
        .then(res => {
          this.$message.success('批量删除成功');
          this.queryTag();
        })
        .catch(err => {
          this.$message.error('批量删除失败');
        });
    },

    addTag() {
      this.show = true;
      this.mode = 'add';
      this.form = {
        name: '',
      };
    },
    editTag(index, row) {
      this.show = true;
      this.mode = 'edit';
      this.$nextTick(() => {
        this.form = Object.assign(this.form, row);
      });
    },
    save() {
      if (this.mode === 'edit') {
        this.API.tag.updateTag(this.form).then(res => {
          this.queryTag();
        });
      } else if (this.mode === 'add') {
        this.API.tag.addTag(this.form).then(res => {
          this.queryTag();
        });
      }
    },
    cancel() {
      this.show = false;
    },

    paginationChange() {
      this.queryTag();
    },
  },
};
</script>

<style>
.tag-manage {
  width: 100%;
  height: 100%;
}
</style>
