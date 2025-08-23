<!--
 * @Autor: huasenjio
 * @Date: 2022-10-07 10:21:54
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-04-13 00:20:32
 * @Description: 用户账号管理
-->

<template>
  <div class="account-user">
    <TableList
      ref="tableList"
      :tableData="users"
      :tableMap="tableMap"
      :formMap="searchFormMap"
      :showAdd="true"
      :total="total"
      @edit="editUser"
      @add="addUser"
      @remove="removeUser"
      @search="queryUser"
      @paginationChange="paginationChange"
      @updatePagination="updatePagination"
    ></TableList>
    <DialogForm
      v-if="show"
      ref="dialogForm"
      width="460"
      :title="mode == 'add' ? '添加用户' : '编辑用户'"
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
  name: 'AccountUser',
  components: { TableList, DialogForm },
  data() {
    return {
      users: [],
      tableMap: [
        {
          label: '账号',
          key: 'id',
        },
        {
          label: '密码',
          key: 'password',
        },
        {
          label: '昵称',
          key: 'name',
        },
        {
          label: '头像',
          key: 'headImg',
        },
        {
          label: '收录站点',
          key: 'records',
        },
        {
          label: '配置',
          key: 'config',
        },
        {
          label: '权限码',
          key: 'code',
        },
        {
          label: '注册时间',
          key: 'createTime',
        },
        {
          label: '更新时间',
          key: 'updateTime',
        },
        {
          label: '是否启用',
          key: 'enabled',
        },
      ],
      total: 0,

      searchFormMap: [
        {
          label: '账号',
          type: 'input',
          key: 'id',
          show: true,
        },
        {
          label: '昵称',
          type: 'input',
          key: 'name',
          show: true,
        },
        {
          label: '权限码',
          key: 'code',
          type: 'select',
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

      // 添加编辑表单
      show: false,
      mode: 'add',
      formMap: [
        {
          label: '账号',
          key: 'id',
          type: 'input',
          editDisabled: true,
        },
        {
          label: '密码',
          key: 'password',
          type: 'input',
        },
        {
          label: '昵称',
          key: 'name',
          type: 'input',
        },
        {
          label: '头像',
          key: 'headImg',
          type: 'input',
        },
        {
          label: '收录站点',
          key: 'records',
          type: 'input',
        },
        {
          label: '配置',
          key: 'config',
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
          disabled: false,
        },
      ],
      rule: {
        id: [{ validator: getElementFormValidator(['isNonEmpty::必填项', 'minLength:5::长度小于5', 'maxLength:50::长度大于50', 'isEmail::请输入邮箱']) }],
        password: [{ validator: getElementFormValidator(['isNonEmpty::必填项', 'minLength:5::长度小于5']) }],
        name: [{ validator: getElementFormValidator(['minLength:2::长度小于2', 'maxLength:20::长度大于20']) }],
      },
      form: {
        id: '',
        password: '',
        code: 0,
        name: '',
        headImg: '',
        records: '',
        config: '',
        enabled: true,
      },
      pageNo: 1,
      pageSize: 10,
    };
  },
  watch: {
    'form.code': {
      handler(val) {
        let targetFormItem = this.formMap.find(item => item.key === 'enabled');
        if (val < 2) {
          targetFormItem.disabled = false;
        } else {
          // 管理员不会被禁用
          this.form.enabled = true;
          targetFormItem.disabled = true;
        }
      },
      deep: true,
    },
  },
  activated() {
    this.queryUser();
  },
  mounted() {
    // this.queryUser();
  },
  methods: {
    queryUser() {
      let formData = this.$refs.tableList.getFormData();
      let params = Object.assign(
        {
          pageNo: this.pageNo,
          pageSize: this.pageSize,
        },
        formData,
      );
      this.API.user
        .findUserByPage(params, {
          notify: false,
        })
        .then(res => {
          this.users = res.data.list;
          this.total = res.data.total;
          this.cancel();
        });
    },
    updatePagination(pageNo, pageSize) {
      this.pageNo = pageNo;
      this.pageSize = pageSize;
    },
    removeUser(index, row, pageNo, pageSize) {
      if (this.$store.state.manage.id === row.id) {
        this.$tips('error', '当前登录账号，不允许被删除！', 'top-right', 1200);
        return;
      }
      this.API.user.removeUser({ _id: row._id }).then(res => {
        this.queryUser();
      });
    },
    addUser() {
      this.show = true;
      this.mode = 'add';
    },
    editUser(index, row) {
      this.show = true;
      this.mode = 'edit';
      this.$nextTick(() => {
        this.form = Object.assign(this.form, row);
      });
    },
    // 分页组件发生变化
    paginationChange(pageNo, pageSize) {
      this.queryUser();
    },
    save() {
      if (this.mode === 'edit') {
        // 编辑
        this.API.user.updateUser(this.form).then(res => {
          this.queryUser();
        });
      } else if (this.mode === 'add') {
        // el-form无法重置_id
        delete this.form._id;
        delete this.form._v;
        // 添加
        this.API.user.addUser(this.form).then(res => {
          this.queryUser();
        });
      }
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

<style>
.account-user {
  width: 100%;
  height: 100%;
}
</style>
