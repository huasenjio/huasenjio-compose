<!--
 * @Autor: huasenjio
 * @Date: 2022-10-04 09:39:40
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-29 13:39:02
 * @Description: 
-->
<template>
  <div class="home-statistics">
    <section v-for="(item, index) in Object.values(statisticsMap)" :key="index" :style="{ backgroundColor: item.color }">
      <div class="left">
        <div class="label text">{{ item.label | emptyTip }}</div>
        <div class="value text">{{ statisticsData[item.key] | emptyTip }}</div>
        <div class="rate text">{{ statisticsData[item.rateKey] | emptyTip }} 同昨日相比</div>
      </div>
      <div class="right">
        <i :class="item.icon"></i>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'HomeStatistics',
  data() {
    return {
      statisticsMap: {
        users: {
          color: 'var(--blue-400)',
          icon: 'iconfont icon-md-contact',
          label: '用户',
          key: 'userCount',
          rateKey: 'userRate',
        },
        manage: {
          color: 'var(--green-400)',
          icon: 'iconfont icon-robot-line',
          label: '管理员',
          key: 'manageCount',
          rateKey: 'manageRate',
        },
        article: {
          color: 'var(--indigo-400)',
          icon: 'iconfont icon-pen-fill',
          label: '文章',
          key: 'articleCount',
          rateKey: 'articleRate',
        },
        file: {
          color: 'var(--red-400)',
          icon: 'iconfont icon-a-documentationupload-line',
          label: '资源文件',
          key: 'fileCount',
          rateKey: 'fileRate',
        },
      },
      statisticsData: {},
    };
  },

  mounted() {
    this.queryOverview();
  },

  methods: {
    queryOverview() {
      this.API.overview(
        {},
        {
          notify: false,
        },
      ).then(res => {
        this.statisticsData = res.data;
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.home-statistics {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-evenly;
  flex-wrap: wrap;
  section {
    width: 24%;
    height: 110px;
    margin-top: 10px;
    border-radius: 4px;
    .left {
      display: inline-block;
      width: 70%;
      padding: 10px;
      color: var(--gray-50);
      .rate {
        font-size: 12px;
        opacity: 0.8;
      }
    }
    .right {
      display: inline-flex;
      width: 30%;
      justify-content: center;
      align-items: center;
      i {
        display: block;
        font-size: 54px;
        opacity: 0.5;
        color: var(--gray-0);
      }
    }
  }
}
</style>
