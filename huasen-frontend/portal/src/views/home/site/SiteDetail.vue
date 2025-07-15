<template>
  <HsDialog
    class="site__detail-dialog"
    :title="`${site.name}详情页`"
    :close-on-click-modal="false"
    :width="width"
    :height="height"
    :showMax="true"
    :buttons="{ comfirm: '立即跳转' }"
    @comfirmDialog="handleComfirm"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <div class="site__content relative">
      <div class="info absolute -left-px-0 -top-px-22 flex items-center text-gray-400">
        <div class="time"><i class="el-icon-time mr-px-2"></i>{{ timePrefix }}</div>
        <div class="view ml-px-10"><i class="el-icon-view mr-px-2"></i>{{ site.pv }}</div>
      </div>
      <div v-if="site.description || tags.length" class="site__head border border-gray-300 border-dashed">
        <div v-if="site.description" class="description">{{ site.description }}</div>
        <div v-if="tags.length" class="tag -ml-px-8">
          <div v-for="item in tags" :key="item" v-randomColor class="text-white inline-block text-xs px-px-8 py-px-2 ml-px-8 rounded-full">
            {{ item }}
          </div>
        </div>
      </div>
      <div class="detail__markdown">
        <Markdown v-if="detail" :value="detail" :showFooter="false"> </Markdown>
        <el-empty v-else style="height: 100%" :image-size="140" description="暂无数据"></el-empty>
        <!-- <Empty v-else style="width: 100%; height: 100%" description="暂无内容"></Empty> -->
      </div>
    </div>
  </HsDialog>
</template>
<script>
import { mapState } from 'vuex';
import { tool, dayjs } from 'huasen-lib';
import HsDialog from '@/components/content/dialog/Dialog.vue';
import Markdown from '@/components/common/markdown/Markdown.vue';
// import Empty from '@/components/content/empty/Empty.vue';
import ResizeHook from '@/mixins/resize-hook.js';
export default {
  name: 'SiteDetail',
  mixins: [ResizeHook],
  components: {
    HsDialog,
    Markdown,
    // Empty,
  },
  props: {
    site: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      width: 768,
      height: 500,
    };
  },
  computed: {
    ...mapState(['user', 'appConfig']),
    detail() {
      return this.site.detail || '';
    },
    tags() {
      let list = [];
      let expandRaw = this.LODASH.get(this.site, 'expand', '{}');
      try {
        const expandObj = JSON.parse(expandRaw);
        list = this.LODASH.get(expandObj, 'tag', []).map(item => `# ${item}`);
      } catch (error) {
        console.error('站点解析异常：', this.site);
      }
      return list;
    },
    timePrefix() {
      const createTime = this.LODASH.get(this.site, 'createTime', '');
      const updateTime = this.LODASH.get(this.site, 'updateTime', '');

      if (!createTime && !updateTime) return 'n年前发布';

      let prefix = '';
      let append = createTime === updateTime ? '发布' : '更新';

      const targetTime = createTime || updateTime;
      const currentTime = dayjs();
      const diffDays = currentTime.diff(targetTime, 'days');
      if (diffDays < 1) {
        prefix = `${currentTime.diff(targetTime, 'hours')}小时前`;
      } else if (diffDays < 7) {
        prefix = `${diffDays}天前`;
      } else if (diffDays < 30) {
        prefix = `${Math.floor(diffDays / 7)}周前`;
      } else if (diffDays < 365) {
        prefix = `${Math.floor(diffDays / 30)}月前`;
      } else {
        prefix = `${Math.floor(diffDays / 365)}年前`;
      }
      return `${prefix}${append}`;
    },
  },
  methods: {
    handleComfirm() {
      this.TOOL.openPage(this.site.url);
    },
    _resizeHook() {
      // 处理宽度
      if (document.body.clientWidth <= this.CONSTANT.appMinWidth) {
        this.width = this.CONSTANT.appMinWidth;
      } else {
        this.width = document.body.clientWidth < 768 ? document.body.clientWidth - 8 : 768;
      }
      // 处理高度
      if (document.body.clientHeight <= this.CONSTANT.appMinHeight) {
        this.height = this.CONSTANT.appMinHeight;
      } else {
        this.height = document.body.clientHeight < 500 ? document.body.clientHeight - 8 : 500;
      }
    },
  },
};
</script>
<style lang="scss">
.site__detail-dialog {
  .site__content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    .site__head {
      width: 100%;
      padding: 12px 4px 12px 4px;
      border-radius: 4px;
      box-sizing: border-box;
      background-color: var(--gray-100);
      & > div {
        margin-top: 8px;
        &:first-child {
          margin-top: 0;
        }
      }
    }
    .detail__markdown {
      margin-top: 10px;
      flex: 1;
      overflow: hidden;
      .h-markdown-container {
        .area-content {
          padding-left: 0 !important;
        }
        .area-catalog {
          padding-right: 0 !important;
        }
      }
    }
  }
}
</style>
