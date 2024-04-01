<!--
 * @Autor: huasenjio
 * @Date: 2021-12-05 16:10:46
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-04-26 00:04:24
 * @Description: 
-->
<template>
  <HsDrawer title="个人中心" :visible.sync="showWrapPerson" :direction="'rtl'" :size="435">
    <div class="wrap-person">
      <header class="information">
        <div class="head">
          <img v-lazy="{ unload: require('@/assets/img/error/slogan.png') }" class="w-full h-full" :src="this.user.headImg" />
        </div>
        <div class="name text">
          <div>{{ user.name || '初级花酱' }}</div>
          <div class="text text-sm text-gray-400">{{ user.id || 'localspace@qq.com' }}</div>
        </div>
        <i title="退出账号" class="iconfont icon-tuichu" @click="exit"></i>
      </header>
      <main>
        <ul>
          <li>
            <div class="left">
              <div class="title">自动备份</div>
              <div class="detail">数据更新之后自动备份（开发中）</div>
            </div>
            <div class="right">
              <el-switch v-model="autoBackup" active-text="开启" inactive-text="关闭"> </el-switch>
            </div>
          </li>
          <li>
            <div class="left">
              <div class="title">注销账号</div>
              <div class="detail">您所有数据将会被销毁（开发中）</div>
            </div>
            <div class="right">
              <i title="注销账号" class="el-icon-remove text-red-500"></i>
            </div>
          </li>
        </ul>
      </main>
    </div>
  </HsDrawer>
</template>
<script>
import { mapState, mapMutations } from 'vuex';
import searchs from '@/config/search.config.js';
import HsDrawer from '@/components/content/drawer/Drawer.vue';
export default {
  name: 'WrapPerson',

  components: { HsDrawer },

  data() {
    return {
      autoBackup: false,
    };
  },

  computed: {
    ...mapState(['user']),

    headImgStyle() {
      let style = {};
      // 图片资源
      let img = this.user.headImg ? this.user.headImg : require('@/assets/img/head/0.png');
      // 设置背景
      style.backgroundImage = `url(${img})`;
      return style;
    },

    showWrapPerson: {
      get() {
        return this.$store.state.showWrapPerson;
      },
      set(value) {
        this.commitAll({
          showWrapPerson: value,
        });
      },
    },
  },

  watch: {
    associationCount: {
      handler(nV) {},
    },
  },

  methods: {
    ...mapMutations(['commitAll']),

    // 退出账号
    exit() {
      this.$tips('success', '账号已退出，即将刷新页面！', 'top-right', 2000, () => {
        this.STORAGE.removeItemByKey(this.CONSTANT.localUser);
        window.location.reload();
      });
    },

    // 关闭个人面板
    closePersonPanel() {
      this.commitAll({
        showWrapPerson: false,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.wrap-person {
  width: 360px;
  margin: 20px auto 0 auto;
  padding-bottom: 20px;
  background-color: var(--gray-0);
  .information {
    width: 90%;
    height: 80px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--gray-200);
    .head {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background-size: 100% 100%;
    }
    .name {
      flex: 1;
      font-size: 18px;
      font-weight: 500;
      color: var(--gray-600);
      margin-left: 20px;
    }
    i {
      font-size: 18px;
      cursor: pointer;
    }
  }
  main {
    width: 90%;
    max-height: 320px;
    margin: 10px auto;
    overflow-x: hidden;
    overflow-y: auto;
    ul {
      li {
        display: flex;
        align-items: flex-start;
        margin-top: 10px;
        .left {
          flex: 1;
          .title {
            font-size: 14px;
          }
          .detail {
            font-size: 10px;
            color: var(--gray-400);
          }
        }
        .right {
          i {
            font-size: 20px;
            cursor: pointer;
          }
        }
      }
      .vertical {
        flex-wrap: wrap;
        .right {
          width: 100%;
        }
      }
    }
  }
}
</style>
