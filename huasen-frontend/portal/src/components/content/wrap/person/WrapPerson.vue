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
          <div>{{ user.name || '花酱大人' }}</div>
          <div class="text text-sm text-gray-400">{{ user.id || 'localspace@qq.com' }}</div>
        </div>
        <i class="iconfont icon-tuichu" @click="exit"></i>
      </header>
      <main>
        <ul>
          <li>
            <div class="left">
              <div class="title">备份本地数据</div>
              <div class="detail">推送数据到云端服务器</div>
            </div>
            <div class="right">
              <i class="iconfont icon-md-clipboard" @click="backup"></i>
            </div>
          </li>
          <li>
            <div class="left">
              <div class="title">应用云端主题</div>
              <div class="detail">使用上次备份的皮肤主题</div>
            </div>
            <div class="right">
              <i class="iconfont icon-interactive-fill" @click="consistentFromCloud('theme')"></i>
            </div>
          </li>
          <li>
            <div class="left">
              <div class="title">同步收录网站</div>
              <div class="detail">拉取已收录的自定义网站数据</div>
            </div>
            <div class="right">
              <i class="iconfont icon-md-sync" @click="consistentFromCloud('record')"></i>
            </div>
          </li>
        </ul>
      </main>
    </div>
  </HsDrawer>
</template>
<script>
import { mapState, mapMutations } from 'vuex';
import HsDrawer from '@/components/content/drawer/Drawer.vue';
export default {
  name: 'WrapPerson',
  components: { HsDrawer },
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
  methods: {
    ...mapMutations(['commitAll']),

    exit() {
      this.$tips('success', '退出成功', 'top-right', 2000, () => {
        this.STORAGE.removeItemByKey(this.CONSTANT.localUser);
        window.location.reload();
      });
    },

    closePersonPanel() {
      this.commitAll({
        showWrapPerson: false,
      });
    },

    // 备份数据
    backup() {
      let { name, headImg, config, records } = this.STORAGE.getItem(this.CONSTANT.localUser);
      let params = {
        config,
        records,
        name,
        headImg,
      };
      this.API.backup(params);
    },

    // 同步云端数据
    consistentFromCloud(tag) {
      this.API.consistentFromCloud().then(result => {
        let user = this.STORAGE.getItem(this.CONSTANT.localUser);
        if (tag === 'record') {
          // 收录站点
          user.records = result.data.records;
        } else if (tag === 'theme') {
          // 主题皮肤数据
          user.config = result.data.config;
        }

        this.STORAGE.setItem(this.CONSTANT.localUser, user);
        this.$store.dispatch('initLocalUserInfo');

        this.$tips('success', '刷新数据', 'top-right', 2000, () => {
          window.location.reload();
        });
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
    overflow-y: auto;
    ul {
      li {
        margin-top: 10px;
        display: flex;
        align-items: center;
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
    }
  }
}
</style>
