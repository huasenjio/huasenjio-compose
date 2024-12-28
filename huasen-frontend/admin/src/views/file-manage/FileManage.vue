<!--
 * @Autor: huasenjio
 * @Date: 2022-02-23 00:02:19
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-12-17 22:13:54
 * @Description: 文件管理页面
-->

<template>
  <div class="FileManage">
    <FileUpLoad class="relative z-10" @upload="upload"></FileUpLoad>
    <main class="px-px-24 relative z-0">
      <div class="head bg-gray-0 flex items-center -mt-px-10 py-px-14">
        <div class="text-lg flex items-center text-gray-800">文件列表</div>
        <el-popconfirm @confirm="remove('multiple')" class="ml-px-10" popper-class="delete-popcomfirm" title="确定删除吗？">
          <el-button slot="reference" size="mini" icon="el-icon-delete" type="danger">批量删除</el-button>
        </el-popconfirm>
        <el-button style="margin-left: 6px" size="mini" icon="el-icon-download" type="info" @click="downloadStore">下载全部</el-button>
        <el-input v-model="filterText" style="width: 300px" class="ml-auto" placeholder="文件关键词" size="mini" clearable>
          <el-select style="width: 95px" v-model="filterType" slot="prepend" placeholder="文件类型">
            <el-option label="全部" value=""></el-option>
            <el-option v-for="item in filterTypes" :label="item.label" :value="item.value" :key="item.value"></el-option>
          </el-select>
        </el-input>
      </div>
      <el-table ref="fileTable" :data="displayFiles" border style="width: 100%">
        <el-table-column type="selection" width="45"> </el-table-column>
        <el-table-column type="index" label="序号" width="65"> </el-table-column>
        <el-table-column prop="url" label="文件地址"> </el-table-column>
        <el-table-column prop="type" label="文件类型" width="100">
          <template slot-scope="scope">
            <font>{{ fileTypeName[scope.row.type] || '未知' }}</font>
          </template>
        </el-table-column>
        <el-table-column prop="" label="缩略图" width="150">
          <template slot-scope="scope">
            <div class="w-full h-px-50 p-px-2 flex justify-center items-center rounded">
              <i v-if="!scope.row.isImg" class="iconfont text-54px" :class="scope.row.iconClass"></i>
              <img v-else class="max-w-full max-h-full" v-lazy :src="scope.row.url" />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="date" label="操作" width="320">
          <template slot-scope="scope">
            <el-popconfirm @confirm="remove('single', scope.row.url, scope.$index)" class="mr-px-10" popper-class="delete-popcomfirm" title="确定删除吗？">
              <el-button slot="reference" size="mini" type="danger">删 除</el-button>
            </el-popconfirm>
            <el-button size="mini" @click="copy(scope.row.url, scope.$index)" type="warning">复 制</el-button>
            <el-button size="mini" @click="preview(scope.row.url, scope.$index)" type="primary">预 览</el-button>
          </template>
        </el-table-column>
      </el-table>
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
    </main>
  </div>
</template>

<script>
import FileUpLoad from '@/components/common/file-upload/FileUpload.vue';
export default {
  name: 'FileManage',
  components: { FileUpLoad },
  data() {
    return {
      files: [],
      fileTypeName: {
        icon: '图标',
        article: '文章附件',
        pdf: 'PDF',
        zip: '压缩包',
        banner: '封面',
        img: '图库',
        default: '其它',
        'open-sh': '开放脚本',
      },
      type2icon: {
        png: 'icon-PNG',
        jpg: 'icon-JPG',
        jpeg: 'icon-JPEG',
        zip: 'icon-ZIP',
        rar: 'icon-RAR',
        pdf: 'icon-PDF',
        md: 'icon-MD',
        doc: 'icon-DOC',
        docx: 'icon-DOCX',
        xls: 'icon-XLS',
        xlsx: 'icon-XLSX',
        ppt: 'icon-PPT',
        pptx: 'icon-PPT',
        html: 'icon-HTML',
        css: 'icon-CSS',
        js: 'icon-JS',
        sh: 'icon-SH',
        mp3: 'icon-MP3',
        mp4: 'icon-MP4',
        java: 'icon-JAVA',
        jar: 'icon-JAR',
        '7z': 'icon-SEVENZ',
      },

      // 前端分页相关
      pageSize: 10,
      currentPage: 1,

      filterType: '',
      filterText: '',
    };
  },

  mounted() {
    this.queryFile();
  },

  computed: {
    total() {
      return this.filterFiles.length;
    },
    filterFiles() {
      let files = [...this.files];
      // 类型筛选
      if (this.filterType) {
        files = files.filter(item => {
          return item.url.includes(`huasen-store/${this.filterType}`);
        });
      }
      // 关键词筛选
      if (this.filterText !== '') {
        files = files.filter(item => {
          return item.url.includes(this.filterText);
        });
      }
      return files;
    },
    displayFiles() {
      let startIndex = (this.currentPage - 1) * this.pageSize;
      let endIndex = this.currentPage * this.pageSize;
      return this.filterFiles.slice(startIndex, endIndex);
    },
    filterTypes() {
      let temp = [];
      Object.keys(this.fileTypeName).forEach(key => {
        temp.push({
          label: this.fileTypeName[key],
          value: key,
        });
      });
      return temp;
    },
  },

  watch: {
    filterFiles(val) {
      this.currentPage = 1;
      this.pageSize = 10;
    },
  },

  methods: {
    downloadStore() {
      this.$tips('info', '功能正在开发中...', null, 2000);
    },

    async upload(file, index, callback) {
      let formdata = new FormData();
      formdata.append('file', file);
      this.API.manage
        .uploadFile(formdata, {
          notify: true,
        })
        .then(res => {
          // 刷新列表
          this.queryFile();
          // 执行回调
          callback();
        });
    },

    // 图片类型则显示图片
    judgeImgFile(filePath) {
      let ext = filePath.split('.').slice(-1).join('');
      return ['png', 'jpg', 'jpeg', 'svg', 'gif'].includes(ext);
    },

    // 获取文件图标
    getFileIcon(filePath) {
      let ext = filePath.split('.').slice(-1).join('');
      return this.type2icon[ext] || 'icon-qitawenjian';
    },

    // 拷贝链接
    copy(url, index) {
      this.TOOL.copyTextToClip(url, '拷贝链接成功');
    },

    // 移除文件
    remove(flag = 'multiple', url, index) {
      let needRemoveUrls = [];
      switch (flag) {
        case 'multiple':
          needRemoveUrls = this.$refs.fileTable.selection.map(item => {
            return item.url;
          });
          break;
        case 'single':
          needRemoveUrls.push(url);
          break;
      }
      if (needRemoveUrls.length === 0) return;

      this.API.file
        .removeFile(
          { filePaths: needRemoveUrls, isMultiple: true },
          {
            notify: true,
          },
        )
        .then(res => {
          this.queryFile();
        });
    },

    // 预览并下载
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
      this.API.file
        .findAllFile(
          {},
          {
            notify: false,
          },
        )
        .then(res => {
          this.files = res.data.map(url => {
            let params = url.split('/');
            let type = params[1];
            let ext = params[params.length - 1].split('.')[1];
            let iconClass = this.getFileIcon(url);
            let isImg = ['png', 'PNG', 'jpg', 'JPG', 'jpeg', 'JPEG', 'svg', 'SVG', 'gif', 'GIF'].includes(ext);
            return {
              url,
              type,
              ext,
              iconClass,
              isImg,
            };
          });
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
