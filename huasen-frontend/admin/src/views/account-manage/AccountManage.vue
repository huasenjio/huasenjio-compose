<!--
 * @Autor: huasenjio
 * @Date: 2022-02-05 11:45:47
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-20 20:38:09
 * @Description: 
-->
<template>
  <div class="account-manage">
    <el-tabs class="tab-group" v-model="activeName">
      <el-tab-pane label="用户列表" name="user"><AccountUser></AccountUser></el-tab-pane>
      <el-tab-pane label="管理列表" name="admin"><AccountAdmin></AccountAdmin></el-tab-pane>
      <el-tab-pane label="黑名单列表" name="blacklist"><AccountBlacklist></AccountBlacklist></el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import AccountAdmin from './admin/AccountAdmin.vue';
import AccountUser from './user/AccountUser.vue';
import AccountBlacklist from './blacklist/AccountBlacklist.vue';
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
  },
};
</script>

<style lang="scss" scoped>
.account-manage {
  width: 100%;
  height: 100%;
  padding: 0 10px;

  ::v-deep .el-tabs {
    width: 100%;
    height: 100%;
    .el-tabs__item {
      font-size: 16px;
    }
    .el-tabs__content {
      width: 100%;
      height: calc(100% - 60px);
      .el-tab-pane {
        width: 100%;
        height: calc(100% - 120px);
      }
    }
  }
}
</style>
