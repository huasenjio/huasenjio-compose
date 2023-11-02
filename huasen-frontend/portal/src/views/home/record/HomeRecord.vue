<!--
 * @Autor: huasenjio
 * @Date: 2021-12-05 20:23:00
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-06-10 00:12:58
 * @Description: 
-->
<template>
  <div v-rightMenu class="home-record">
    <header>
      <div class="title">
        自定义网站
        <i class="iconfont icon-md-attach"></i>
      </div>
      <ul>
        <li @click="openAddMode">
          <i class="iconfont icon-tianjia"></i>
          <span class="sm:hidden">添加</span>
        </li>
        <li @click="openEditMode" :class="{ active: isEditMode }">
          <i class="iconfont icon-md-settings"></i>
          <span class="sm:hidden">编辑</span>
        </li>
        <li @click="openDeleteMode" :class="{ active: isDeleteMode }">
          <i class="iconfont icon-md-trash"></i>
          <span class="sm:hidden">管理</span>
        </li>
        <li @click="handleCopy">
          <i class="iconfont icon-md-cut"></i>
          <span class="sm:hidden">拷贝</span>
        </li>
        <li @click="handleRecovery">
          <i class="iconfont icon-md-sync"></i>
          <span class="sm:hidden">恢复</span>
        </li>
        <li @click="openCustomWallpaper">
          <i class="iconfont icon-md-happy"></i>
          <span class="sm:hidden">墙纸</span>
        </li>
        <li @click="openSimpleMode">
          <i class="iconfont icon-md-qr-scanner"></i>
          <span class="sm:hidden">全屏</span>
        </li>
      </ul>
    </header>
    <main v-rightMenu>
      <ul v-balance>
        <li class="record-item" v-for="(item, index) in user.records" :key="`${item}-${index}`">
          <a class="inherit-text text" v-if="!isEditMode" :title="item.remark" :href="item.url" target="_blank">
            {{ item.name }}
          </a>
          <!-- 编辑的替身 -->
          <a v-else @click="handleEdit(item, index)" class="pointer text" :class="{ 'edit-mode': isEditMode }">
            {{ item.name }}
          </a>
          <!-- 删除按钮 -->
          <i v-if="isDeleteMode" @click="handleDelete(item)" class="iconfont icon-md-close-circle delete-icon"> </i>
        </li>
      </ul>
    </main>
    <DialogForm v-if="showForm" :visible.sync="showForm" ref="dialogForm" width="400" :buttons="{ comfirm: '确 认', cancel: '取 消' }" :title="title" :close-on-click-modal="false" :formData="formData" :formMap="formMap" :formRule="formRule" @comfirmForm="save" @cancelForm="cancel"></DialogForm>
    <CustomWallpaperDrawer v-if="showCustom" title="个性墙纸" :visible.sync="showCustom" :direction="'rtl'" :size="435"></CustomWallpaperDrawer>
  </div>
</template>
<script>
import { mapState, mapMutations } from 'vuex';
import { getElementFormValidator } from '@/plugin/strategy.js';

import Bus from '@/plugin/event-bus.js';
import * as BusType from '@/plugin/event-type.js';

import DialogForm from '@/components/content/dialogForm/DialogForm.vue';
import CustomWallpaperDrawer from '@/components/content/customWallPaperDrawer/CustomWallpaperDrawer.vue';

export default {
  name: 'HomeRecord',
  components: { DialogForm, CustomWallpaperDrawer },
  data() {
    return {
      // 状态相关
      isEditMode: false,
      isDeleteMode: false,
      showForm: false,
      showCustom: false,

      // 输入表单相关
      title: '',
      formData: {
        name: '',
        url: '',
        remark: '',
      },

      formMap: [
        {
          key: 'name',
          label: '站点名称',
          type: 'input',
        },
        {
          key: 'url',
          label: '站点链接',
          type: 'input',
        },
        {
          key: 'remark',
          label: '备注',
          type: 'textarea',
          minRows: 4,
        },
      ],
      formRule: {
        name: [{ validator: getElementFormValidator(['isNoEmpty::必填项', 'isChinese::请输入汉字/英文/数字']), trigger: 'blur' }],
        url: [{ validator: getElementFormValidator(['isNoEmpty::必填项', 'isUrl::请输入正确的网址']), trigger: 'blur' }],
      },
    };
  },
  computed: {
    ...mapState(['user', 'config']),
  },
  watch: {
    // 打开编辑面板时，关闭监听 / 聚焦搜索框事件。
    showForm(val) {
      if (val) {
        Bus.pubEv(BusType.HOME_DESTROY_KEYUP_SLASH);
      } else {
        Bus.pubEv(BusType.HOME_CREATE_KEYUP_SLASH);
      }
    },
  },
  methods: {
    ...mapMutations(['commitAll']),

    openAddMode() {
      this.title = `添加网站`;
      this.isEditMode = false;
      this.isDeleteMode = false;
      this.showForm = true;
    },

    openEditMode() {
      this.isEditMode = !this.isEditMode;
    },

    openDeleteMode() {
      this.isDeleteMode = !this.isDeleteMode;
    },

    // 处理编辑
    handleEdit(site, index) {
      this.title = `编辑网站`;
      this.showForm = true;
      this.$nextTick(() => {
        this.formData = Object.assign(this.formData, site);
      });
    },

    // 打开极简模式
    openSimpleMode() {
      this.handleCommit({
        user: {
          config: {
            simpleMode: !this.user.config.simpleMode,
          },
        },
      });
    },

    // 删除
    handleDelete(record) {
      let records = [...this.user.records];
      records.map((item, index) => {
        if (item.id == record.id) {
          records.splice(index, 1);
        }
      });
      this.handleCommit({
        user: {
          records: records,
        },
      });
    },

    // 添加和修改
    save() {
      // 构造数据结构
      let records = [...this.user.records];
      let record = Object.assign(
        {
          id: '',
          name: '',
          url: '',
          remark: '',
        },
        {
          ...this.formData,
        },
      );
      if (this.isEditMode) {
        // 编辑
        for (let i = 0; i < records.length; i++) {
          if (records[i].id == record.id) {
            records[i] = record;
          }
        }
      } else {
        // 添加
        record.id = this.TOOL.getUid(16, 8);
        records.push(record);
      }
      this.handleCommit({
        user: {
          records: records,
        },
      });
      this.cancel();
    },

    // 取消表单编辑
    cancel() {
      if (this.$refs.dialogForm) {
        this.$refs.dialogForm.resetFormFields();
      }
      this.showForm = false;
    },

    // 统一处理提交
    handleCommit(data) {
      if (Object.keys(data).length === 0) return;
      this.commitAll(data);
      this.$store.dispatch('snapshoot');
    },

    // 复制数据剪贴板
    handleCopy() {
      let { records, config } = this.$store.state.user;
      // 备份的数据
      let backupData = {
        records,
        config,
      };
      this.TOOL.copyTextToClip(JSON.stringify(backupData), '已复制到剪贴板，请立即粘贴保存！');
    },

    // 恢复保存数据
    async handleRecovery() {
      Bus.pubEv(BusType.HOME_DESTROY_KEYUP_SLASH);
      try {
        let rawData;
        if (navigator.clipboard && window.isSecureContext) {
          // https、localhost、127.0.0.1 状态下可用
          rawData = await navigator.clipboard.readText();
        } else {
          // 不安全状态下使用对话框形式
          rawData = prompt('请粘贴之前拷贝保存的数据进行恢复');
        }
        // 排除不输入的情况下
        if (!rawData) return;
        let data = JSON.parse(rawData);
        let { records, config } = data;
        // 排除移除异常情况
        if (!Array.isArray(records)) throw new Error();
        if (Object.prototype.toString.call(config) !== '[object Object]') throw new Error();
        // 覆盖到仓库
        this.handleCommit({
          user: {
            records,
            config,
          },
        });
        this.$tips('success', '数据恢复成功', 'top-right', 2000, () => {
          window.location.reload();
        });
      } catch (err) {
        this.$tips('error', '恢复数据失败', 'top-right', 2000);
      } finally {
        Bus.pubEv(BusType.HOME_CREATE_KEYUP_SLASH);
      }
    },
    openCustomWallpaper() {
      this.showCustom = true;
    },
  },
};
</script>

<style lang="scss" scoped>
.home-record {
  width: 100%;
  margin: 285px auto 0 auto;
  padding: 10px 0 20px 0;
  background-color: var(--gray-0);
  header {
    padding: 10px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .title {
      display: flex;
      align-items: center;
      font-size: 16px;
      font-weight: 500;
      i {
        font-size: 20px;
        font-weight: 500;
      }
    }
    ul {
      display: flex;
      align-items: center;
      font-size: 16px;
      font-weight: 500;
      li {
        margin-left: 10px;
        cursor: pointer;
        i {
          cursor: pointer;
        }
      }
      .active {
        color: var(--red-500);
        i {
          color: var(--red-500);
        }
      }
    }
  }
  main {
    width: calc(100% - 40px);
    margin: 0 auto;
    border-radius: 3px;
    background-color: var(--gray-50);
    ul {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      .record-item {
        position: relative;
        width: 110px;
        padding: 10px;
        display: flex;
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
        a {
          width: 80%;
          border: 1px solid transparent;
          border-radius: 3px;
          text-align: center;
          color: var(--gray-600);
        }
        i {
          position: absolute;
          top: 0px;
          right: 10px;
          cursor: pointer;
        }
        .edit-mode {
          border: 1px solid var(--red-400) !important;
          color: var(--red-400);
        }
        .delete-icon {
          color: var(--red-400);
        }
      }
    }
  }
}
</style>
