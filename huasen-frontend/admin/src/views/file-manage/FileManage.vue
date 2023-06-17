<!--
 * @Autor: huasenjio
 * @Date: 2022-02-23 00:02:19
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-12-17 22:13:54
 * @Description: 文件管理页面
-->

<template>
  <div class="FileManage">
    <FileUpLoad @upload="upload"></FileUpLoad>
    <main>
      <ul v-if="this.files.length !== 0">
        <li class="file-card" v-for="(item, index) in displayFiles" :key="`${item}-${index}`">
          <div class="content-panel">
            <div class="file-box">
              <i v-if="!judgeImgFile(item)" class="iconfont" :class="getFileIcon(item)"></i>
              <img v-else :src="item" />
            </div>
          </div>
          <div class="shadow-panel">
            <span @click="copy(item, index)">复制</span>
            <span @click="preview(item, index)">预览</span>
            <el-popconfirm @confirm="remove(item, index)" popper-class="delete-popcomfirm" title="您确定删除该项吗？">
              <span slot="reference">删除</span>
            </el-popconfirm>
          </div>
        </li>
        <el-pagination
          class="w-full flex mt-px-28"
          :page-sizes="[10, 20, 50, 100]"
          :current-page="currentPage"
          :pageSize="pageSize"
          :total="total"
          @size-change="handlePageSizeChange"
          @current-change="handleCurrentPageChange"
          popper-class="page-size-popper"
          layout="total, sizes, prev, pager, next, jumper"
          background
        >
        </el-pagination>
      </ul>
      <Empty v-else class="mt-px-64"></Empty>
    </main>
  </div>
</template>

<script>
import FileUpLoad from '@/components/common/file-upload/FileUpload.vue';
import Empty from '@/components/content/empty/Empty.vue';
export default {
  name: 'FileManage',
  computed: {
    total() {
      return this.files.length;
    },
    displayFiles() {
      let startIndex = (this.currentPage - 1) * this.pageSize;
      let endIndex = this.currentPage * this.pageSize;
      return this.files.slice(startIndex, endIndex);
    },
  },
  data() {
    return {
      files: [],

      type2icon: {
        png: 'icon-tupian',
        jpg: 'icon-tupian',
        jpeg: 'icon-tupian',
        zip: 'icon-yasuobao',
        rar: 'icon-yasuobao',
        pdf: 'icon-pdf',
        md: 'icon-file-markdown',
        doc: 'icon-file-word',
        docx: 'icon-file-word',
        xls: 'icon-excel',
        xlsx: 'icon-excel',
        ppt: 'icon-file-ppt',
        pptx: 'icon-file-ppt',
        html: 'icon-HTML',
        css: 'icon-CSS',
        js: 'icon-js',
      },

      // 前端分页相关
      pageSize: 10,
      currentPage: 1,
    };
  },

  components: {
    FileUpLoad,
    Empty,
  },

  mounted() {
    this.queryFile();
  },

  methods: {
    async upload(file, index, callback) {
      let formdata = new FormData();
      formdata.append('file', file);
      this.API.uploadFile(formdata, {
        notify: true,
      }).then(res => {
        // 刷新列表
        this.queryFile();
        // 执行回调
        callback();
      });
    },

    // 图片类型则显示图片
    judgeImgFile(filePath) {
      let ext = filePath
        .split('.')
        .slice(-1)
        .join('');
      return ['png', 'jpg', 'jpeg', 'svg', 'gif'].includes(ext);
    },

    getFileIcon(filePath) {
      let ext = filePath
        .split('.')
        .slice(-1)
        .join('');
      return this.type2icon[ext];
    },

    copy(item, index) {
      this.TOOL.copyTextToClip(item, '拷贝链接成功');
    },

    remove(path, index) {
      this.API.removeFile(
        { filePath: path },
        {
          notify: true,
        },
      ).then(res => {
        this.queryFile();
      });
    },

    preview(item, index) {
      window.open(item);
    },

    handlePageSizeChange(pageSize) {
      this.pageSize = pageSize;
    },
    handleCurrentPageChange(currentPage) {
      this.currentPage = currentPage;
    },

    queryFile() {
      this.API.findAllFile(
        {},
        {
          notify: false,
        },
      ).then(res => {
        this.files = res.data;
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.FileManage {
  main {
    margin: 10px 0;
    ul {
      display: flex;
      flex-wrap: wrap;
      .file-card {
        position: relative;
        flex: 1;
        margin: 10px;
        .content-panel {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 4px 2px;
          box-sizing: border-box;
          .file-box {
            width: 210px;
            height: 140px;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            i {
              font-size: 54px;
              color: var(--gray-600);
            }
            img {
              width: 100%;
            }
          }
        }
        .shadow-panel {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          justify-content: space-around;
          align-items: center;
          border-radius: 3px;
          background-color: rgba(30, 30, 30, 0.1);
          transition: 0.5s;
          span {
            font-weight: 500;
            color: var(--gray-0);
            cursor: pointer;
          }
          &:hover {
            background-color: rgba(30, 30, 30, 0.3);
          }
        }
      }
    }
  }
  ::v-deep .el-pagination {
    padding: 2px 14px;
    .el-pagination__sizes {
      margin-right: auto;
    }
  }
}
</style>
