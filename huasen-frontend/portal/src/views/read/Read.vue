<!--
 * @Autor: huasenjio
 * @Date: 2022-04-05 23:40:21
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-24 00:33:30
 * @Description: 
-->
<template>
  <div class="read">
    <main>
      <header>
        <div class="title-group flex my-px-10">
          <div class="title text-3xl flex-1 text">
            {{ article.title }}
          </div>
          <div class="icon-group text-xl pointer" @click="goBack">
            返回
            <i class="iconfont icon-tuichu text-xl"></i>
          </div>
        </div>
        <div class="tag-group text">
          <div v-for="item in tags" :key="item" v-randomColor class="text-white inline-block text-xs px-px-8 py-px-2 first:mx-px-0 mx-px-4 rounded-full">
            {{ item }}
          </div>
        </div>
        <div class="info-group">
          <div class="text">{{ `花森原创 · 最后修改于${time}` }}</div>
        </div>
      </header>
      <div class="content">
        <HMarkdown :value="article.content"></HMarkdown>
        <footer class="footer-group">
          <div class="text">版权说明：MIT开源协议</div>
          <div class="text">免责声明：文章仅供学习交流 禁止用于商业用途</div>
        </footer>
      </div>
    </main>
  </div>
</template>
<script>
export default {
  name: 'Read',
  data() {
    return {
      article: {
        title: '文章标题',
        time: '1979-01-01',
        tag: '简洁/用心/愉悦',
        content: '文章内容....',
      },
    };
  },
  created() {
    this.initData();
    this.hideSidebar();
  },
  destroyed() {
    this.showSidebar();
  },
  computed: {
    tags() {
      return this.article.tag ? this.article.tag.split('/') : [];
    },
    time() {
      if (this.article.time) {
        let temps = this.article.time.split('-');
        return `${temps[0]}年${temps[1]}月${temps[2]}日`;
      } else {
        return '1979年01月01日';
      }
    },
  },
  methods: {
    initData() {
      if (!this.$route.params.id) {
        this.$router.push('/article');
      } else {
        this.queryArticleById(this.$route.params.id);
      }
    },
    queryArticleById(_id) {
      this.API.getArtcileById({ _id })
        .then(res => {
          let article = res.data[0];
          if (article) {
            this.article = article;
          }
        })
        .catch(err => {
          this.goBack();
        });
    },
    goBack() {
      this.$router.go(-1);
    },
    hideSidebar() {
      this.$store.commit('commitAll', {
        showWrapSidebar: false,
      });
    },
    showSidebar() {
      this.$store.commit('commitAll', {
        showWrapSidebar: true,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.read {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  main {
    width: calc(100% - 20px);
    height: calc(100% - 20px);
    display: flex;
    flex-direction: column;
    padding: 10px;
    box-sizing: border-box;
    overflow-x: hidden;
    overflow-y: auto;
    background-color: var(--gray-0);
    header {
      width: 100%;
      height: 110px;
      .title-group {
        width: 100%;
        height: 42px;
        display: flex;
        align-items: center;
      }
      .tag-group {
        width: 100%;
        height: 22px;
        margin: 10px 0;
      }
      .info-group {
        width: 100%;
        height: 24px;
        color: var(--gray-700);
      }
    }
    .content {
      flex: 1;
      .footer-group {
        width: 100%;
        height: 58px;
        display: flex;
        justify-content: center;
        flex-direction: column;
        margin: 10px 0;
        padding: 0 10px;
        border-left: 5px solid var(--gray-300);
        border-right: 5px solid var(--gray-300);
        background-color: var(--gray-100);
        box-sizing: border-box;
      }
    }
  }
  @media only screen and (min-width: 1024px) and (min-height: 640px) {
    .tag-group {
      width: calc(100% - 150px) !important;
    }
    .info-group {
      width: calc(100% - 150px) !important;
    }
    .footer-group {
      width: calc(100% - 150px) !important;
    }
  }
}
</style>
