<!--
 * @Autor: huasenjio
 * @Date: 2022-01-15 21:36:31
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-29 23:01:33
 * @Description: 
-->
<template>
  <div class="article-manage">
    <TableList
      :tableData="articles"
      :tableMap="tableMap"
      :formData.sync="searchForm"
      :formMap="searchFormMap"
      :total="total"
      @paginationChange="paginationChange"
      @updatePagination="updatePagination"
      @edit="editArticle"
      @remove="removeArticle"
      @search="queryArticle"
    ></TableList>
  </div>
</template>

<script>
import TableList from '@/components/content/table-list/TableList.vue';
export default {
  name: 'ArticleManage',
  components: { TableList },
  data() {
    return {
      articles: [],
      total: 0,

      tableMap: [
        {
          label: '索引值',
          key: '_id',
        },
        {
          label: '文章标题',
          key: 'title',
        },
        {
          label: '发布者',
          key: 'manageId',
        },
        {
          label: '权限码',
          key: 'code',
        },
        {
          label: '标签',
          key: 'tag',
        },
        {
          label: '文章内容',
          key: 'content',
        },
        {
          label: '是否草稿',
          key: 'isDraft',
        },
        {
          label: '封面链接',
          key: 'bannerImg',
        },
        {
          label: '日期',
          key: 'time',
        },
      ],
      searchForm: {
        manageId: '',
        title: '',
      },
      searchFormMap: [
        {
          label: '文章标题',
          type: 'input',
          key: 'title',
        },
        {
          label: '发布者',
          type: 'input',
          key: 'manageId',
        },
      ],
      pageNo: 1,
      pageSize: 10,
    };
  },
  created() {
    this.queryArticle();
  },
  methods: {
    // 获取全部的新闻数据
    queryArticle() {
      let params = Object.assign(
        {
          pageNo: this.pageNo,
          pageSize: this.pageSize,
        },
        this.searchForm,
      );
      this.API.findArticleByPage(params, { notify: false }).then(res => {
        this.articles = res.data.list;
        this.total = res.data.total;
      });
    },

    updatePagination(pageNo, pageSize) {
      this.pageNo = pageNo;
      this.pageSize = pageSize;
    },

    // 分页组件发生变化
    paginationChange(pageNo, pageSize) {
      this.queryArticle();
    },

    // 编辑
    editArticle(index, row) {
      this.$router.push({ name: 'Public', params: row });
    },

    // 删除
    removeArticle(index, row, pageNo, pageSize) {
      this.API.removeArticle({
        _id: row._id,
      }).then(res => {
        this.queryArticle();
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.article-manage {
  width: 100%;
  height: calc(100% - 120px);
  padding: 10px;
}
</style>
