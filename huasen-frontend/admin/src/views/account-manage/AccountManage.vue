<!--
 * @Autor: huasenjio
 * @Date: 2022-02-05 11:45:47
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-29 12:25:36
 * @Description: 
-->
<template>
  <div class="account-manage">
    <el-tabs class="tab-group" v-model="activeName">
      <el-tab-pane label="用户列表" name="user"><AccountUser></AccountUser></el-tab-pane>
      <el-tab-pane label="管理列表" name="admin"><AccountAdmin></AccountAdmin></el-tab-pane>
      <el-tab-pane label="黑名单列表" name="blacklist"><AccountBlacklist></AccountBlacklist></el-tab-pane>
      <el-tab-pane label="日志管理" name="record"><AccountRecord></AccountRecord></el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import AccountAdmin from './admin/AccountAdmin.vue';
import AccountUser from './user/AccountUser.vue';
import AccountBlacklist from './blacklist/AccountBlacklist.vue';
import AccountRecord from './record/AccountRecord.vue';
export default {
  name: 'AccountManage',
  data() {
    return {
      activeName: 'user',
    };
  },
  components: {
    AccountAdmin,
    AccountUser,
    AccountBlacklist,
    AccountRecord,
  },
};
</script>

<style lang="scss" scoped>
.account-manage {
  padding: 0 10px;
  .tab-group {
    ::v-deep .el-tabs__item {
      font-size: 16px;
    }
  }
}
</style>
