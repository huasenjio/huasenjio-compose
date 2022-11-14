<!--
 * @Autor: huasenjio
 * @Date: 2022-01-15 21:36:31
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-11-07 00:04:48
 * @Description: 
-->
<template>
  <div class="ArticleManage p-px-10">
    <TableList
      :tableData="articles"
      :tableMap="tableMap"
      :formData.sync="searchForm"
      :formMap="searchFormMap"
      :total="total"
      @paginationChange="paginationChange"
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
    };
  },
  created() {
    this.queryArticle();
  },
  methods: {
    // 获取全部的新闻数据
    queryArticle(pageNo, pageSize) {
      let params = Object.assign(
        {
          pageNo: pageNo,
          pageSize: pageSize,
        },
        this.searchForm,
      );
      this.API.findArticleByPage(params, { notify: false }).then(res => {
        this.articles = res.data.list;
        this.total = res.data.total;
      });
    },

    // 分页组件发生变化
    paginationChange(pageNo, pageSize) {
      this.queryArticle(pageNo, pageSize);
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
        this.queryArticle(pageNo, pageSize);
      });
    },
  },
};
</script>
