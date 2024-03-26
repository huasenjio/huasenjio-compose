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
      <header class="mb-px-40">
        <div class="title-group flex my-px-10">
          <div class="title text-3xl flex-1 text">
            {{ article.title }}
          </div>
          <div class="icon-group text-xl pointer" @click="goBack">
            返回
            <i class="iconfont icon-tuichu text-xl"></i>
          </div>
        </div>
        <div class="info-group border border-gray-300 border-dashed">
          <div class="time">
            <div class="text">{{ `${appConfig.site.name}原创 · 最后修改于${time}` }}</div>
          </div>
          <div class="tag">
            <div v-for="item in tags" :key="item" v-randomColor class="text-white inline-block text-xs px-px-8 py-px-2 first:mx-px-0 mx-px-4 rounded-full">
              {{ item }}
            </div>
          </div>
        </div>
      </header>
      <div class="content">
        <HMarkdown :value="article.content || content"></HMarkdown>
      </div>
    </main>
  </div>
</template>
<script>
import { mapState } from 'vuex';
export default {
  name: 'Read',
  data() {
    return {
      loading: true,
      article: {
        title: '示例文章',
        time: '1979-01-01 00:00:00',
        tag: '用心/简洁/美观',
        content: '文字文字文字文字文字文字文字文字文字文字文字文字....',
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
    ...mapState(['appConfig']),
    tags() {
      return this.article.tag ? this.article.tag.split('/') : ['无标签'];
    },
    time() {
      if (this.article.time) {
        // let temps = this.article.time.split('-');
        return this.article.time;
      } else {
        return '1979-01-01 00:00:00';
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
      this.API.getArtcileById(
        { _id },
        {
          notify: false,
        },
      )
        .then(res => {
          if (!res.data[0]) {
            this.$tips('error', '您查阅文章找不见了', 'top-right', 1200, () => {
              this.$router.push('/article');
            });
          } else {
            let article = res.data[0];
            if (article) {
              this.article = article;
              this.loading = false;
            }
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
        .title {
          font-weight: 500;
          color: var(--gray-600);
          text-shadow: 1px 1px 2px var(--gray-200);
        }
      }
      .info-group {
        width: 100%;
        padding: 12px 4px 4px 4px;
        border-radius: 4px;
        box-sizing: border-box;
        background-color: var(--gray-100);
        margin: 10px 0;
        .time {
          width: 100%;
          height: 24px;
          margin-bottom: 4px;
          color: var(--gray-600);
          text-shadow: 1px 1px 2px var(--gray-200);
        }
        .tag {
          width: 100%;
          height: 24px;
          padding-bottom: 4px;
          white-space: nowrap;
          overflow-x: auto;
          overflow-y: hidden;
        }
      }
    }
    .content {
      flex: 1;
      overflow: hidden;
    }
  }
}
</style>
