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
      ref="tableList"
      :tableData="articles"
      :tableMap="tableMap"
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
        // {
        //   label: '文章内容',
        //   key: 'content',
        // },
        {
          label: '访问量',
          key: 'pv',
          width: 64,
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
      searchFormMap: [
        {
          label: '标题',
          type: 'input',
          key: 'title',
          show: true,
        },
        {
          label: '发布者',
          type: 'input',
          key: 'manageId',
          show: true,
        },
        {
          label: '标签内容',
          type: 'input',
          key: 'tag',
          show: false,
        },
        {
          label: '权限码',
          key: 'code',
          type: 'select',
          value: undefined,
          typeConfig: {
            options: this.CONSTANT.dictionary.code,
          },
          show: true,
        },
        {
          label: '是否草稿',
          key: 'isDraft',
          type: 'select',
          value: undefined,
          typeConfig: {
            options: [
              {
                label: '草稿',
                value: true,
              },
              {
                label: '已发布',
                value: false,
              },
            ],
          },
          show: false,
        },
      ],
      pageNo: 1,
      pageSize: 10,
    };
  },
  // 进入路由时
  activated() {
    this.queryArticle();
  },
  created() {
    // this.queryArticle();
  },
  methods: {
    // 获取全部的新闻数据
    queryArticle() {
      let formData = this.$refs.tableList.getFormData();
      let params = Object.assign(
        {
          pageNo: this.pageNo,
          pageSize: this.pageSize,
        },
        formData,
      );
      this.API.article.findArticleByPage(params, { notify: false }).then(res => {
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
      this.$router.push({ name: 'Public', query: { _id: row._id } });
    },

    // 删除
    removeArticle(index, row, pageNo, pageSize) {
      this.API.article
        .removeArticle({
          _id: row._id,
        })
        .then(res => {
          this.queryArticle();
        });
    },
  },
};
</script>
<style lang="scss" scoped>
.article-manage {
  width: 100%;
  height: 100%;
  padding: 10px;
}
</style>
