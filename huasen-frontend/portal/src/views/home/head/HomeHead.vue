<!--
 * @Autor: huasenjio
 * @Date: 2022-08-30 00:45:43
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-21 00:10:42
 * @Description: 
-->
<template>
  <div
    v-rightMenu
    class="home-head"
    :class="{
      clear: !showGrossGlass && headBgConfig.clear,
      white: headBgConfig.white,
      'gross-glass': showGrossGlass || headBgConfig.grossGlass,
    }"
  >
    <section class="fold" @click="hiddenWrapLeft">
      <i class="iconfont icon-md-barcode"></i>
    </section>
    <section class="menu" @click="hiddenMenu">
      <i class="iconfont  icon-md-menu"></i>
    </section>
    <section v-if="showMenu" class="collapse">
      <ul class="links">
        <li v-for="(item, index) in links" :key="index" @click="jump(item, index)">
          <i :class="item.iconfontClass" class="icon"></i>
          <span class="text">{{ item.text }}</span>
        </li>
      </ul>
    </section>
    <section class="today">
      <div class="clock-group">
        <Clock></Clock>
      </div>
      <div class="weather-group">
        <Weather></Weather>
      </div>
    </section>
    <section v-if="showMenu" class="take">
      <el-dropdown class="dropdown" trigger="click" @command="handleSelectJournal">
        <span class="el-dropdown-link pointer">
          {{ currentJournal.name || '无订阅源' }}
          <i class="el-icon-arrow-down el-icon--right"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-for="item in journals" :key="item._id" :command="item._id">
            {{ item.name }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </section>
    <section v-if="showMenu" @click="sign" class="sign">
      {{ signText || '花酱大人' }}
    </section>
  </div>
</template>
<script>
import { mapState, mapMutations } from 'vuex';
import Clock from '@/components/common/clock/Clock.vue';
import Weather from '@/components/common/weather/Weather.vue';
export default {
  name: 'HomeHead',

  components: {
    Clock,
    Weather,
  },

  props: {
    headBgConfig: {
      type: Object,
      default: () => {
        return {
          clear: false,
          white: false,
          grossGlass: true,
        };
      },
    },
  },

  data() {
    return {
      showMenu: false,
      selectedTake: '常用热门',
      takes: [],
      journals: [],
      currentJournal: {},
      links: [
        {
          iconfontClass: 'iconfont icon-md-home',
          text: '花森小窝',
          url: 'http://huasen.cc/',
          isArticle: false,
        },
        {
          iconfontClass: 'iconfont icon-md-stats',
          text: '更新日志',
          url: this.$store.state.appConfig.article.course,
          isArticle: true,
        },
        {
          iconfontClass: 'iconfont icon-md-at',
          text: '关于我们',
          url: this.$store.state.appConfig.article.about,
          isArticle: true,
        },
      ],
    };
  },

  computed: {
    ...mapState(['showWrapLeft', 'user']),
    showGrossGlass() {
      return this.showMenu && document.body.clientWidth <= 1024 ? true : false;
    },
    signText() {
      return this.user.token ? this.user.name : '注册登录';
    },
  },

  mounted() {
    this.querySites();
    this.queryJournals();
    this.initMenu();
  },

  methods: {
    ...mapMutations(['commitAll']),

    querySites() {
      this.API.findSiteByCode({}, { notify: false }).then(res => {
        this.commitAll({
          sites: res.data,
        });
      });
    },

    // 请求订阅源
    queryJournals() {
      this.API.findJournal(
        {},
        {
          notify: false,
        },
      ).then(res => {
        if (res.data.length !== 0) {
          this.journals = res.data;
          this.handleSelectJournal(this.journals[0]._id);
        }
      });
    },

    handleSelectJournal(_id) {
      let exist = this.journals.find(item => item._id === _id);
      if (!exist) return;
      this.API.findJournalInformationById({ _id }).then(res => {
        this.selectJournal(res.data);
      });
    },

    selectJournal(journal) {
      this.currentJournal = journal;
      this.commitAll({
        categorySites: journal.series,
      });
    },

    // 隐藏右边栏
    hiddenWrapLeft() {
      this.commitAll({
        showWrapLeft: !this.showWrapLeft,
      });
    },

    // 登录用户
    sign() {
      if (this.user.token) {
        // 已经登录，打开个人中心面板
        this.commitAll({
          showWrapPerson: true,
        });
      } else {
        // 未登录，打开登录面板
        this.commitAll({
          showWrapSign: true,
        });
      }
    },

    // 折叠菜单
    hiddenMenu() {
      this.showMenu = !this.showMenu;
    },

    // 根据窗口宽度大于1024，则不折叠菜单
    initMenu() {
      let debounce = this.LODASH.debounce(
        () => {
          if (document.body.clientWidth > 1024) {
            this.showMenu = true;
          } else {
            this.showMenu = false;
          }
        },
        100,
        {
          leading: true,
          trailing: true,
        },
      );
      window.addEventListener('resize', debounce);
      this.$once('hook:beforeDestory', () => {
        window.removeEventListener('resize', debounce);
      });
      // 手动触发一次resize事件
      this.$nextTick(() => {
        let event = new Event('resize', { bubbles: true, cancelable: false });
        document.dispatchEvent(event);
      });
    },

    // 跳转
    jump(item, index) {
      let url = item.url;
      if (index === 0) {
        this.TOOL.openPage(url);
      } else {
        this.TOOL.jumpToRead(this, url);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.home-head {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 75px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  color: var(--gray-50);
  z-index: 2;
  .fold {
    order: 1;
    width: 75px;
    height: 75px;
    display: flex;
    justify-content: center;
    align-items: center;
    i {
      font-size: 28px;
      cursor: pointer;
    }
  }
  .menu {
    display: none;
    i {
      cursor: pointer;
    }
  }
  .collapse {
    order: 3;
    .links {
      display: flex;
      align-items: center;
      li {
        margin-left: 12px;
        cursor: pointer;

        &:first-of-type {
          margin-left: 0;
        }
      }
    }
  }
  .today {
    order: 4;
    height: 75px;
    display: flex;
    align-items: center;
    margin-left: 14px;
    margin-right: auto;
    .clock-group {
      order: 1;
    }
    .weather-group {
      order: 2;
      max-width: 185px;
      display: flex;
      align-items: center;
    }
  }
  .take {
    order: 5;
    .dropdown {
      color: inherit;
    }
  }
  .sign {
    order: 6;
    margin-left: 18px;
    margin-right: 22px;
    max-width: 100px;
    cursor: pointer;
  }
  i {
    color: inherit;
  }
}

.clear {
  background-color: transparent;
  i {
    color: inherit;
  }
}
.gross-glass {
  color: var(--gray-600) !important;
  background-color: var(--gray-o5) !important;
  backdrop-filter: blur(8px) !important;
  i {
    color: inherit;
  }
}
.white {
  color: var(--gray-700) !important;
  background-color: var(--gray-0) !important;
  i {
    color: inherit;
  }
}

@media only screen and (max-width: 1024px) {
  .home-head {
    width: 100%;
    height: auto;
    .fold {
      display: none;
    }
    .menu {
      order: 2;
      margin-right: 10px;
      display: block;
      i {
        font-size: 24px;
      }
    }
    .collapse {
      order: 3;
      width: 100%;
      .links {
        flex-direction: column;
        padding: 0px 15px;
        box-sizing: border-box;
        li {
          width: 100%;
          margin-top: 10px;
          margin-left: 0px;
        }
      }
    }
    .today {
      order: 1;
      margin: 0;
      margin-left: 10px;
      margin-right: auto;
      .clock-group {
        order: 2;
      }
      .weather-group {
        order: 1;
      }
    }
    .take {
      order: 5;
      width: 100%;
      padding: 10px 30px;
      box-sizing: border-box;
    }
    .sign {
      order: 6;
      min-width: 100%;
      margin: 0;
      padding: 0px 30px 10px 30px;
      box-sizing: border-box;
    }
  }
}
</style>
