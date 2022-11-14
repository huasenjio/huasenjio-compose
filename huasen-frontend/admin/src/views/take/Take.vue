<!--
 * @Autor: huasenjio
 * @Date: 2022-10-12 23:59:38
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-23 12:32:52
 * @Description: 
-->

<template>
  <div class="take">
    <header>
      <div class="name">{{ this.editTake.name | emptyTip }}</div>
      <i title="添加栏目" class="iconfont icon-tianjia text-green-500" @click="addType"></i>
      <i title="返回列表" class="iconfont icon-md-arrow-round-forward text-blue-500" @click="back"></i>
    </header>
    <main>
      <div class="thead">
        <el-row :gutter="20">
          <el-col :span="3">网站名称</el-col>
          <el-col :span="4">网站链接</el-col>
          <el-col :span="4">网站描述</el-col>
          <el-col :span="4">网站备注</el-col>
          <el-col :span="4">网站图标</el-col>
          <el-col :span="5">操作</el-col>
        </el-row>
      </div>
      <Draggable v-model="series" ghostClass="ghost" filter=".option" chosenClass="chosen" animation="400" @end="onDragEnd">
        <transition-group>
          <div class="tbody" v-for="(typeItem, index) in series" :key="`${typeItem.typeName}${index}`">
            <div class="banner">
              <div class="type text">{{ typeItem.typeName | emptyTip }}</div>
              <ul class="option">
                <li title="添加链接" class="iconfont icon-xinzeng text-green-500" @click="addSite(index)"></li>
                <li title="粘贴链接" class="iconfont icon-md-clipboard text-purple-500" @click="pasteSite(index)"></li>
                <li title="编辑栏目" class="iconfont icon-bianji text-orange-500" @click="editType(index)"></li>
                <li title="删除栏目">
                  <el-popconfirm @confirm="removeType(index)" popper-class="delete-popcomfirm" title="您确定删除该栏目吗？">
                    <i slot="reference" class="iconfont icon-md-trash text-red-500"></i>
                  </el-popconfirm>
                </li>
              </ul>
            </div>
            <div class="content">
              <el-row class="content-item pt-px-12 my-px-4" :gutter="20" v-for="(siteItem, siteIndex) in typeItem.sites" :key="siteIndex">
                <el-col class="text" :span="3">{{ siteItem.name | emptyTip }}</el-col>
                <el-col :title="siteItem.url" class="text" :span="4">
                  {{ siteItem.url | emptyTip }}
                </el-col>
                <el-col class="text" :span="4">{{ siteItem.describe | emptyTip }}</el-col>
                <el-col class="text" :span="4">{{ siteItem.remark | emptyTip }}</el-col>
                <el-col class="text" :span="4">{{ siteItem.icon | emptyTip }}</el-col>
                <el-col class="option" :span="5">
                  <el-button size="mini" type="warning" @click="copySite(index, siteIndex)">
                    复制
                  </el-button>
                  <el-button size="mini" type="primary" @click="editSite(index, siteIndex)">
                    编辑
                  </el-button>
                  <el-popconfirm class="ml-px-10" @confirm="removeSite(index, siteIndex)" popper-class="delete-popcomfirm" title="您确定删除该链接吗？">
                    <el-button slot="reference" size="mini" type="danger">删除</el-button>
                  </el-popconfirm>
                </el-col>
              </el-row>
            </div>
          </div>
        </transition-group>
      </Draggable>
    </main>
    <DialogForm
      width="460"
      title="栏目"
      :visible.sync="showType"
      :formMap.sync="typeFormMap"
      :formData.sync="typeFormData"
      :formRule.sync="typeFormRule"
      :mode="typeMode"
      :buttons="{ comfirm: '确 认', cancel: '取 消' }"
      @comfirmForm="saveType"
      @cancelForm="cancelType"
    ></DialogForm>
    <DialogForm
      width="460"
      title="链接"
      :visible.sync="showSite"
      :formMap.sync="siteFormMap"
      :formData.sync="siteFormData"
      :formRule.sync="siteFormRule"
      :mode="siteMode"
      :buttons="{ comfirm: '确 认', cancel: '取 消' }"
      @comfirmForm="saveSite"
      @cancelForm="cancelSite"
    ></DialogForm>
  </div>
</template>

<script>
import { getElementFormValidator } from '@/plugin/strategy.js';
import DialogForm from '@/components/content/dialog-form/DialogForm.vue';
import Draggable from 'vuedraggable';
export default {
  name: 'Take',
  components: { DialogForm, Draggable },
  data() {
    return {
      // 类型表单
      showType: false,
      typeMode: 'add',
      typeFormMap: [
        {
          label: '栏目名称',
          key: 'typeName',
          type: 'input',
        },
      ],
      typeFormData: {
        typeName: '',
      },
      typeFormRule: {
        typeName: [{ validator: getElementFormValidator(['isNoEmpty::必填项']), trigger: 'blur' }],
      },

      // 链接表单
      showSite: false,
      siteMode: 'add',
      siteFormMap: [
        {
          label: '名称',
          key: 'name',
          type: 'input',
        },
        {
          label: '链接',
          key: 'url',
          type: 'input',
        },
        {
          label: '图标',
          key: 'icon',
          type: 'icon',
        },
        {
          label: '描述',
          key: 'describe',
          type: 'input',
        },
        {
          label: '备注',
          key: 'remark',
          type: 'input',
        },
      ],
      siteFormData: {
        name: '',
        url: '',
        icon: '',
        describe: '',
        remark: '',
      },
      siteFormRule: {
        name: [{ validator: getElementFormValidator(['isNoEmpty::必填项', 'isChinese::仅支持汉字/字母/数字']), trigger: 'blur' }],
        url: [{ validator: getElementFormValidator(['isNoEmpty::必填项', 'isUrl::请输入正确的网址链接']), trigger: 'blur' }],
      },

      editTake: {
        _id: '',
        name: '',
        series: '',
      },

      series: [
        {
          typeName: '测试栏目',
          sites: [
            {
              name: '测试链接1',
              url: 'http://localhost:9000/#/take',
              describe: '测试描述',
              remark: '测试备注',
              icon: 'huasen-store/default/1665682164056.png',
            },
            {
              name: '测试链接2',
              url: 'http://localhost:9000/#/take',
              describe: '测试描述',
              remark: '测试备注',
              icon: 'huasen-store/default/1665682164056.png',
            },
          ],
        },
      ],
    };
  },
  mounted() {
    this.initTake();
  },
  methods: {
    // 初始化通过路由传递过来的参数
    initTake() {
      if (Object.keys(this.$route.params).length !== 0) {
        let { _id, name, series } = this.$route.params;
        this.editTake._id = _id;
        this.editTake.name = name;
        this.editTake.series = series;
        this.series = this.TOOL.copyObject(JSON.parse(series));
      } else {
        this.$router.go(-1);
      }
    },

    // 删除栏目
    removeType(typeIndex) {
      this.series.splice(typeIndex, 1);
      this.updateTake();
    },

    // 编辑栏目
    editType(typeIndex) {
      this.showType = true;
      this.typeMode = 'edit';
      this.currentTypeIndex = typeIndex;
      this.$nextTick(() => {
        this.typeFormData.typeName = this.series[typeIndex].typeName;
      });
    },

    // 添加栏目
    addType() {
      this.showType = true;
      this.typeMode = 'add';
    },

    // 保存栏目
    saveType() {
      if (this.typeMode === 'edit') {
        this.series[this.currentTypeIndex].typeName = this.typeFormData.typeName;
      } else if (this.typeMode === 'add') {
        this.series.push({
          typeName: this.typeFormData.typeName,
          sites: [],
        });
      }
      this.updateTake();
      this.cancelType();
    },

    // 取消栏目操作
    cancelType() {
      this.showType = false;
    },

    // 添加链接
    addSite(typeIndex) {
      this.showSite = true;
      this.siteMode = 'add';
      this.currentTypeIndex = typeIndex;
    },

    // 拷贝链接
    copySite(typeIndex, siteIndex) {
      this.currentCopySite = this.TOOL.copyObject(this.series[typeIndex].sites[siteIndex]);
      this.$tips('success', '你复制已成功·粘贴至栏目中', 'top-right', 1200);
    },

    // 粘贴链接
    pasteSite(typeIndex) {
      this.series[typeIndex].sites.push(this.currentCopySite);
      this.updateTake();
    },

    // 编辑链接
    editSite(typeIndex, siteIndex) {
      this.showSite = true;
      this.siteMode = 'edit';
      this.currentTypeIndex = typeIndex;
      this.currentSiteIndex = siteIndex;
      this.$nextTick(() => {
        let site = this.TOOL.copyObject(this.series[typeIndex].sites[siteIndex]);
        this.siteFormData = Object.assign(this.siteFormData, site);
      });
    },

    // 移除链接
    removeSite(typeIndex, siteIndex) {
      this.series[typeIndex].sites.splice(siteIndex, 1);
      this.updateTake();
    },

    // 保存链接
    saveSite() {
      let site = this.TOOL.copyObject(this.siteFormData);
      if (this.siteMode === 'edit') {
        this.series[this.currentTypeIndex].sites.splice(this.currentSiteIndex, 1, site);
      } else if (this.siteMode === 'add') {
        this.series[this.currentTypeIndex].sites.push(site);
      }
      this.updateTake();
      this.cancelSite();
    },

    // 取消链接相关操作
    cancelSite() {
      this.showSite = false;
    },

    // 保存资源
    updateTake() {
      this.API.updateTake(
        {
          _id: this.editTake._id,
          series: JSON.stringify(this.series),
        },
        { notify: true },
      );
    },

    // 返回订阅列表
    back() {
      this.$router.go(-1);
    },

    // 拖拽结束后记录
    onDragEnd() {
      this.updateTake();
    },
  },
};
</script>

<style lang="scss" scoped>
.take {
  padding: 10px;
  color: var(--gray-600);
  header {
    display: flex;
    align-items: center;
    .name {
      color: var(--gray-700);
      font-weight: 600;
    }
    i {
      margin-left: 8px;
      font-size: 20px;
      cursor: pointer;
    }
  }
  main {
    margin-top: 16px;
    .thead {
    }
    .tbody {
      margin-top: 16px;
      .banner {
        display: flex;
        align-items: center;
        .type {
          width: 100px;
          color: var(--gray-500);
        }
        ul {
          margin-left: 10px;
          display: flex;
          align-items: center;
          li {
            margin-left: 8px;
            cursor: pointer;
          }
        }
      }
      .content {
        font-size: 12px;
        color: var(--gray-500);
        .content-item {
          &:hover {
            background-color: var(--gray-100);
          }
        }
      }
    }
  }
}
.chosen {
  padding: 10px;
  background-color: var(--gray-100);
}
.ghost {
  box-shadow: 0 0px 0px 2px var(--red-400), 0px 0px 0px 4px var(--blue-400);
}
</style>
