<!--
 * @Autor: huasenjio
 * @Date: 2022-10-07 10:21:54
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-04-13 00:20:47
 * @Description: 管理员账号管理
-->

<template>
  <div class="pin-manage">
    <TableList
      ref="tableList"
      :tableData="pins"
      :tableMap="tableMap"
      :formMap="searchFormMap"
      :showAdd="true"
      :showEdit="true"
      :showSelection="true"
      :showRemoveMany="true"
      :total="total"
      @add="addPin"
      @edit="editPin"
      @remove="removePin"
      @removeMany="removeManyPins"
      @search="queryPin"
      @paginationChange="paginationChange"
      @updatePagination="updatePagination"
    ></TableList>
    <DialogForm
      v-if="show"
      ref="dialogForm"
      width="460"
      height="360"
      :title="mode == 'add' ? '添加标记' : '编辑标记'"
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
  name: 'PinManage',
  components: { TableList, DialogForm },
  data() {
    return {
      // 表格相关
      pins: [],
      tableMap: [
        {
          label: '标记名称',
          key: 'name',
        },
        {
          label: '标记颜色',
          key: 'color',
        },
        {
          label: '背景颜色',
          key: 'bgColor',
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
          label: '标记名称',
          key: 'name',
          type: 'input',
        },
        {
          label: '标记颜色',
          key: 'color',
          type: 'color',
        },
        {
          label: '背景颜色',
          key: 'bgColor',
          type: 'color',
        },
      ],

      rule: {
        name: [{ validator: getElementFormValidator(['isNonEmpty::必填项']) }],
      },

      form: {
        name: '',
        color: '',
        bgColor: '',
      },

      pageNo: 1,
      pageSize: 10,
    };
  },
  // 进入路由时
  activated() {
    this.init();
  },

  mounted() {
    // this.init();
  },
  methods: {
    init() {
      this.queryPin();
    },
    queryPin() {
      let formData = this.$refs.tableList.getFormData();
      let params = Object.assign(
        {
          pageNo: this.pageNo,
          pageSize: this.pageSize,
        },
        formData,
      );
      this.API.pin
        .findByPage(params, {
          notify: false,
        })
        .then(res => {
          this.pins = res.data.list;
          this.total = res.data.total;
          this.cancel();
        });
    },

    updatePagination(pageNo, pageSize) {
      this.pageNo = pageNo;
      this.pageSize = pageSize;
    },

    removePin(index, row) {
      this.API.pin.removePin({ _id: row._id }).then(res => {
        this.queryPin();
      });
    },
    removeManyPins(selection) {
      if (!selection || selection.length === 0) {
        this.$message.warning('请选择要删除的标记');
        return;
      }
      const ids = selection.map(item => item._id);
      this.API.pin
        .removeManyPins({ ids })
        .then(res => {
          this.$message.success('批量删除成功');
          this.queryPin();
        })
        .catch(err => {
          this.$message.error('批量删除失败');
        });
    },
    addPin() {
      this.show = true;
      this.mode = 'add';
      this.form = {
        name: '',
        color: '',
        bgColor: '',
      };
    },
    editPin(index, row) {
      this.show = true;
      this.mode = 'edit';
      this.$nextTick(() => {
        this.form = Object.assign(this.form, row);
      });
    },
    // 分页组件发生变化
    paginationChange(pageNo, pageSize) {
      this.queryPin();
    },
    save() {
      if (this.mode === 'edit') {
        this.API.pin.updatePin(this.form).then(res => {
          this.queryPin();
        });
      } else if (this.mode === 'add') {
        this.API.pin.addPin(this.form).then(res => {
          this.queryPin();
        });
      }
    },
    cancel() {
      this.show = false;
    },
  },
};
</script>

<style>
.pin-manage {
  width: 100%;
  height: 100%;
}
</style>
