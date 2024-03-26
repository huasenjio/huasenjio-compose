<template>
  <HsDialog
    :title="'网站公告'"
    :visible.sync="showNotice"
    :width="width"
    :height="height"
    :showMax="true"
    :close-on-click-modal="false"
    :buttons="{ comfirm: '标记为已读', cancel: '跳转至文章' }"
    v-bind="$attrs"
    v-on="$listeners"
    @comfirmDialog="recordNotice"
    @closeDialog="readNotice"
    @close="close"
  >
    <Markdown :value="noticeContent"> </Markdown>
  </HsDialog>
</template>
<script>
import { mapState, mapMutations, mapActions } from 'vuex';
import HsDialog from '@/components/content/dialog/Dialog.vue';
import Markdown from '@/components/common/markdown/Markdown.vue';
import ResizeHook from '@/mixins/resize-hook.js';
export default {
  name: 'WrapNotice',
  mixins: [ResizeHook],
  components: {
    HsDialog,
    Markdown,
  },
  data() {
    return {
      showNotice: false,

      width: 768,
      height: 500,

      noticeId: '',
      noticeTime: '',
      noticeContent: '',
    };
  },
  mounted() {
    this.queryNotice();
  },
  computed: {
    ...mapState(['user', 'appConfig']),
  },
  methods: {
    queryNotice() {
      let _id = this.appConfig.article.notice;
      if (_id) {
        this.API.getArtcileById(
          { _id },
          {
            notify: false,
          },
        ).then(res => {
          let noticeInfo = this.STORAGE.getItem(this.CONSTANT.appNotice) || {};
          let notice = this.LODASH.get(res, 'data[0]') || {};
          if (Object.keys(notice).length !== 0 && (notice._id !== noticeInfo._id || notice.time !== noticeInfo.time)) {
            // 有公告的前提下，如果id、时间对不上，就会弹送公告
            this.noticeId = notice._id;
            this.noticeTime = notice.time;
            this.noticeContent = notice.content;
            this.showNotice = true;
          }
        });
      }
    },

    // 标记为已读回调
    recordNotice() {
      this.showNotice = false;
      // 存储已提示公告信息
      this.STORAGE.setItem(this.CONSTANT.appNotice, {
        _id: this.noticeId,
        time: this.noticeTime,
      });
    },

    // 调整至文章回调
    readNotice() {
      this.showNotice = false;
      this.$router.push({ path: `/read/${this.noticeId}` });
    },

    close() {
      this.showNotice = false;
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
<style></style>
