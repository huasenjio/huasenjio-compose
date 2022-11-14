<template>
  <div class="hs-file-upload">
    <div class="content">
      <div class="left" @click="fileClick">
        <img src="./img/upload.png" />
      </div>
      <div class="right" @drop="drop($event)" @dragenter="dragenter($event)" @dragover="dragover($event)">
        将文件拖到此处上传
      </div>
    </div>
    <footer>
      <div class="text">
        <div>
          <i class="iconfont icon-md-link text-lg"></i>
          选中 {{ imgList.length }} 个文件总共 {{ bytesToSize(this.size) }}
        </div>
      </div>
      <input @change="fileChange($event)" type="file" id="upload-file" multiple style="display: none" />
      <div class="img-box" v-show="imgList.length !== 0">
        <div class="item shadow-lg" v-for="(item, index) in imgList" v-dragging="{ item: item, list: imgList, group: 'color' }" :key="index">
          <div class="top">
            <i class="iconfont icon-tianjia" @click="uploadFile(index)"></i>
            <img src="./img/delete.png" class="icon-delete" @click="fileDel(index)" />
          </div>
          <img :src="item.file.src" />
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'HsFileUpLoad',
  data() {
    return {
      fileIcon: require('./img/file.png'),
      imgList: [],
      size: 0,
      limit: undefined,
    };
  },
  methods: {
    // 点击上传
    uploadFile(index) {
      let file = this.imgList[index].file;
      this.$emit('upload', file, index, () => {
        this.size = this.size - file.size;
        this.imgList.splice(index, 1);
      });
    },

    //设置上传文件个数
    limitClick(state) {
      this.imgList = [];
      if (state) this.limit = 10;
      else this.limit = undefined;
    },

    // 点击上传图标
    fileClick() {
      document.getElementById('upload-file').click();
    },

    // 文件改变
    fileChange(el) {
      if (!el.target.files[0].size) return;
      this.fileList(el.target);
      el.target.value = '';
    },

    fileList(fileList) {
      let files = fileList.files;
      for (let i = 0; i < files.length; i++) {
        //判断是否为文件夹
        if (files[i].type != '') {
          this.fileAdd(files[i]);
        } else {
          //文件夹处理
          this.folders(fileList.items[i]);
        }
      }
    },

    //文件夹处理
    folders(files) {
      let _this = this;
      //判断是否为原生file
      if (files.kind) {
        files = files.webkitGetAsEntry();
      }
      files.createReader().readEntries(function(file) {
        for (let i = 0; i < file.length; i++) {
          if (file[i].isFile) {
            _this.foldersAdd(file[i]);
          } else {
            _this.folders(file[i]);
          }
        }
      });
    },

    foldersAdd(entry) {
      let _this = this;
      entry.file(function(file) {
        _this.fileAdd(file);
      });
    },

    fileAdd(file) {
      if (this.limit !== undefined) this.limit--;
      if (this.limit !== undefined && this.limit < 0) return;
      //总大小
      this.size = this.size + file.size;
      //判断是否为图片文件
      if (file.type.indexOf('image') == -1) {
        file.src = this.fileIcon;
        this.imgList.push({
          file,
        });
      } else {
        let reader = new FileReader();
        let image = new Image();
        let _this = this;
        reader.readAsDataURL(file);
        reader.onload = function() {
          file.src = this.result;
          image.onload = function() {
            let width = image.width;
            let height = image.height;
            file.width = width;
            file.height = height;
            _this.imgList.push({
              file,
            });
          };
          image.src = file.src;
        };
      }
    },

    fileDel(index) {
      this.size = this.size - this.imgList[index].file.size; //总大小
      this.imgList.splice(index, 1);
      if (this.limit !== undefined) this.limit = this.imgList.length;
    },

    bytesToSize(bytes) {
      if (bytes === 0) return '0 B';
      let k = 1000, // or 1024
        sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(bytes) / Math.log(k));
      return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
    },

    dragenter(el) {
      el.stopPropagation();
      el.preventDefault();
    },

    dragover(el) {
      el.stopPropagation();
      el.preventDefault();
    },

    drop(el) {
      el.stopPropagation();
      el.preventDefault();
      this.fileList(el.dataTransfer);
    },
  },
};
</script>
<style lang="scss" scoped>
.hs-file-upload {
  width: 100%;
  color: var(--gray-700);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  .content {
    width: 100%;
    height: 200px;
    padding: 20px;
    display: flex;
    justify-content: space-between;
    div {
      display: flex;
      justify-content: center;
      align-items: center;
      border: 1px dashed var(--gray-400);
    }
    .left {
      border-radius: 10px;
      width: 30%;
      float: left;
      img {
        width: 54px;
        height: 54px;
      }
    }
    .right {
      border-radius: 10px;
      width: 68%;
      float: right;
    }
  }
  footer {
    padding: 10px 20px;
    .text {
      margin-left: 5px;
    }
    .img-box {
      display: flex;
      flex-wrap: wrap;
      margin: 10px 0px;
      .item {
        position: relative;
        width: 150px;
        height: 100px;
        padding: 4px 0px;
        margin: 2px 5px;
        display: flex;
        justify-content: center;
        align-items: center;
        .top {
          position: absolute;
          top: 0px;
          right: 0px;
          left: 0px;
          padding: 4px 2px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: rgba(0, 0, 0, 0.5);
          i {
            font-size: 20px;
            color: var(--gray-0);
          }
          .icon-delete {
            width: 16px;
          }
        }
        img {
          max-width: 100%;
          max-height: 100%;
          vertical-align: middle;
        }
      }
    }
    ul {
      margin-left: 5px;
      li {
        margin: 3px 0;
      }
    }
  }
}
</style>
