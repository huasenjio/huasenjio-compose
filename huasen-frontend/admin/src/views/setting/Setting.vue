<template>
  <div v-if="loaded" class="setting">
    <el-collapse class="setting-collapse" v-model="activeNames">
      <!-- 站点配置 -->
      <el-collapse-item name="1">
        <template slot="title"> <i class="el-icon-monitor mr-px-4"></i> 站点配置</template>
        <el-form :model="site" :rules="siteRule" ref="siteForm" class="site-form">
          <el-row :gutter="10">
            <el-col :span="12">
              <el-form-item prop="brandName">
                <el-input placeholder="请输入品牌名" v-model="site.brandName">
                  <template slot="prepend">品牌名称</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="brandUrl">
                <el-input placeholder="请输入链接" v-model="site.brandUrl">
                  <template slot="prepend">品牌图片</template>
                  <el-button slot="append" icon="el-icon-picture" @click="handleUpload(site, 'brandUrl')"></el-button>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="redirectUrl">
                <el-input placeholder="请输入重定向地址" v-model="site.redirectUrl">
                  <template slot="prepend">重定向地址</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="serviceQRCodeUrl">
                <el-input placeholder="请输入二维码地址" v-model="site.serviceQRCodeUrl">
                  <template slot="prepend">客服二维码</template>
                  <el-button slot="append" icon="el-icon-picture" @click="handleUpload(site, 'serviceQRCodeUrl')"></el-button>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="guidePageName">
                <el-input placeholder="请输入引导页名称" v-model="site.guidePageName">
                  <template slot="prepend">引导页名称</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="guidePageUrl">
                <el-input placeholder="请输入引导页地址" v-model="site.guidePageUrl">
                  <template slot="prepend">引导页地址</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="footerHtml">
                <el-input placeholder="请输入页脚代码" v-model="site.footerHtml">
                  <template slot="prepend">页脚代码</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="jwt">
                <el-input placeholder="请输入令牌密钥" v-model="site.jwt">
                  <template slot="prepend">令牌密钥</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="jwtLiveTime">
                <el-input placeholder="1000 = 1秒" @input="value => (site.jwtLiveTime = Number(value.replace(/[^0-9.]/g, '')) || 604800)" v-model="site.jwtLiveTime">
                  <template slot="prepend">令牌存活时间</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="openLabelClassification">
                <el-switch v-model="site.openLabelClassification" active-text="开启标签分类" inactive-text="关闭标签分类"> </el-switch>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-collapse-item>

      <!-- 主题配置 -->
      <el-collapse-item name="2">
        <template slot="title"> <i class="el-icon-magic-stick mr-px-4"></i>主题配置</template>
        <el-form :model="theme" :rules="themeRule" ref="themeForm" class="theme-form">
          <el-row :gutter="10">
            <el-col :span="12">
              <el-form-item prop="default.bg">
                <el-input placeholder="< 图片链接 | 颜色代码 >" v-model="theme.default.bg">
                  <template slot="prepend">默认背景</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="default.color">
                <el-input placeholder="< 颜色代码 >" v-model="theme.default.color">
                  <template slot="prepend">背景字体颜色</template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <div class="pure">
            <div class="px-px-2 text-bold">
              纯色背景列表
              <i class="el-icon-circle-plus text-green-500 pointer" @click="addTheme('pure')"></i>
            </div>
            <ul class="flex overflow-x-auto px-px-2 py-px-6">
              <li v-for="(item, index) in theme.pure" :key="index" class="flex-shrink-0 w-px-184 relative ml-px-15 first:ml-px-0 shadow p-px-8 rounded">
                <i class="el-icon-top absolute -top-px-6 right-px-12 z-10 text-blue-500 pointer" title="设为默认" @click="setDefaultTheme('pure', item, index)"></i>
                <i class="el-icon-remove absolute -top-px-6 -right-px-4 z-10 text-red-500 pointer" title="移除色块" @click="removeTheme('pure', item, index)"></i>

                <el-tooltip :disabled="!!!checkColorCode(item.background)" class="item" effect="light" content="内容格式非法" placement="right">
                  <el-input :class="{ 'error-tip': !!checkColorCode(item.background) }" v-model="item.background" placeholder="背景颜色">
                    <el-color-picker v-model="item.background" class="relative top-px-5 left-px-0" popper-class="setting-color-picker-popper" slot="prefix" size="mini"></el-color-picker>
                  </el-input>
                </el-tooltip>

                <el-tooltip :disabled="!!!checkColorCode(item.color)" class="item" effect="light" content="内容格式非法" placement="right">
                  <el-input :class="{ 'error-tip': !!checkColorCode(item.color) }" v-model="item.color" class="mt-px-4" placeholder="字体颜色">
                    <el-color-picker v-model="item.color" class="relative top-px-5 left-px-0" popper-class="setting-color-picker-popper" slot="prefix" size="mini"></el-color-picker>
                  </el-input>
                </el-tooltip>
              </li>
            </ul>
          </div>

          <div class="wallpaper">
            <div class="px-px-2 text-bold">
              壁纸背景列表
              <i class="el-icon-circle-plus text-green-500 pointer" @click="addTheme('wallpaper')"></i>
            </div>
            <ul class="flex overflow-x-auto px-px-2 py-px-6">
              <li v-for="(item, index) in theme.wallpaper" :key="index" class="flex-shrink-0 w-px-184 relative ml-px-15 first:ml-px-0 shadow p-px-8 rounded">
                <i class="el-icon-top absolute -top-px-6 right-px-12 z-10 text-blue-500 pointer" title="设为默认" @click="setDefaultTheme('wallpaper', item, index)"></i>
                <i class="el-icon-remove absolute -top-px-6 -right-px-4 z-10 text-red-500 pointer" title="移除壁纸" @click="removeTheme('wallpaper', item, index)"></i>

                <div class="w-full h-px-80 mb-px-4 text-center p-px-4 bg-gray-100 border border-dashed border-gray-400 rounded">
                  <img v-lazy="{ unload: require('@/assets/img/error/image-error.png') }" class="max-w-full max-h-full rounded" :src="item.background" />
                </div>

                <el-tooltip :disabled="!!!checkImgUrl(item.background)" class="item" effect="light" content="内容格式非法" placement="right">
                  <el-input :class="{ 'error-tip': !!checkImgUrl(item.background) }" v-model="item.background" placeholder="图片链接">
                    <div slot="prefix" class="w-px-28 h-px-28 p-px-4 relative top-px-5 left-px-0 border border-solid border-gray-300 rounded flex justify-center items-center pointer">
                      <i class="el-icon-picture text-lg text-gray-600" @click="handleUpload(item, 'background')"></i>
                    </div>
                  </el-input>
                </el-tooltip>

                <el-tooltip :disabled="!!!checkColorCode(item.headerFontColor)" class="item" effect="light" content="内容格式非法" placement="right">
                  <el-input :class="{ 'error-tip': !!checkColorCode(item.headerFontColor) }" v-model="item.headerFontColor" class="mt-px-4" placeholder="字体颜色">
                    <el-color-picker v-model="item.headerFontColor" class="relative top-px-5 left-px-0" popper-class="setting-color-picker-popper" slot="prefix" size="mini"></el-color-picker>
                  </el-input>
                </el-tooltip>
              </li>
            </ul>
          </div>
        </el-form>
      </el-collapse-item>

      <!-- 文章配置 -->
      <el-collapse-item name="3">
        <template slot="title"> <i class="el-icon-document mr-px-4"></i>文章配置</template>
        <el-form :model="article" ref="articleForm" class="article-form" label-position="top">
          <el-row :gutter="10">
            <el-col :span="12">
              <el-form-item prop="changelog" label="更新日志">
                <el-select v-model="article.changelog" clearable filterable placeholder="请选择更新日志">
                  <el-option v-for="item in articleOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="about" label="关于我们">
                <el-select v-model="article.about" clearable filterable placeholder="请选择关于我们">
                  <el-option v-for="item in articleOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="help" label="帮助文档">
                <el-select v-model="article.help" clearable filterable placeholder="请选择帮助文档">
                  <el-option v-for="item in articleOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-collapse-item>

      <!-- 邮箱配置 -->
      <el-collapse-item name="4">
        <template slot="title"> <i class="el-icon-message mr-px-4"></i>邮箱配置</template>
        <el-form :model="mail" ref="mailForm" class="mail-form">
          <el-row :gutter="10">
            <el-col :span="12">
              <el-form-item prop="host">
                <el-input placeholder="< 主机 >" v-model="mail.host">
                  <template slot="prepend">host</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="port">
                <el-input placeholder="< 端口 >" @input="value => (mail.port = Number(value.replace(/[^0-9.]/g, '')) || 465)" v-model="mail.port">
                  <template slot="prepend">port</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="user">
                <el-input placeholder="< 用户 >" v-model="mail.user">
                  <template slot="prepend">user</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="mtp">
                <el-input placeholder="< 通行码 >" v-model="mail.mtp">
                  <template slot="prepend">mtp</template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-collapse-item>

      <!-- 配置总览 -->
      <el-collapse-item name="5">
        <template slot="title"> <i class="el-icon-table-lamp mr-px-4"></i>配置总览</template>
        <el-row :gutter="10">
          <el-col :span="24">
            <div class="result">
              <VueJsonEditor class="json-edit" v-model="setting" :show-btns="false" :expandedOnStart="true" mode="form"></VueJsonEditor>
            </div>
          </el-col>
        </el-row>
      </el-collapse-item>
    </el-collapse>

    <!-- 操作按钮 -->
    <div class="operation mt-px-10 flex justify-end">
      <el-button @click="saveConfig" type="primary">保存配置</el-button>
      <el-button @click="reset" type="danger">重置配置</el-button>
    </div>

    <!-- input 方式兼容性好 -->
    <input style="display: none" id="js-img-picker" @change="upload($event)" accept="image/gif,image/jpeg,image/jpg,image/png" type="file" />
  </div>
</template>

<script>
import VueJsonEditor from 'vue-json-editor';
import { getElementFormValidator, checkParamsByRules } from '@/plugin/strategy.js';
export default {
  name: 'Setting',

  props: {},

  components: { VueJsonEditor },

  computed: {
    setting: {
      get() {
        let { site, theme, mail, article } = this;
        let data = { site, theme, mail, article };
        return data;
      },
      set(value) {},
    },
  },

  data() {
    return {
      loaded: false,

      activeNames: ['1', '2', '3', '4'],
      // 表单数据
      site: {
        brandName: '花森',
        brandUrl: '',
        redirectUrl: 'http://huasen.cc/',
        guidePageName: '花森小窝',
        guidePageUrl: 'http://huasen.cc/',
        footerHtml: '',
        openLabelClassification: false,
        jwt: '',
        jwtLiveTime: 604800,
        serviceQRCodeUrl: '',
      },
      siteRule: {
        redirectUrl: [{ validator: getElementFormValidator(['isUrl::链接格式不正确']), trigger: 'change' }],
        guidePageUrl: [{ validator: getElementFormValidator(['isUrl::链接格式不正确']), trigger: 'change' }],
        brandUrl: [{ validator: getElementFormValidator(['isImgUrl::链接格式不正确']), trigger: 'change' }],
        serviceQRCodeUrl: [{ validator: getElementFormValidator(['isImgUrl::链接格式不正确']), trigger: 'change' }],
        jwt: [{ validator: getElementFormValidator(['minLength:32::请输入32个字符', 'maxLength:32::请输入32个字符', 'isEnglish::请输入数字/字母']), trigger: 'change' }],
      },

      mail: {
        host: 'smtp.qq.com',
        port: 465,
        user: '932397243@qq.com',
        mtp: '',
      },
      article: {
        changelog: '',
        about: '',
        help: '',
      },
      theme: {
        pure: [
          {
            color: '#FFFFFF',
            background: '#000000',
          },
          {
            color: '#000000',
            background: '#FFFFFF',
          },
        ],
        wallpaper: [
          {
            headerFontColor: '#FFFFFF',
            background: 'https://s2.loli.net/2023/03/31/oSz3nJB84dC5ueh.jpg',
          },
          {
            headerFontColor: '#000000',
            background: 'https://s2.loli.net/2023/03/31/W9n7RoFvhtlpg6U.jpg',
          },
        ],
        default: {
          bg: '',
          color: '',
        },
      },
      themeRule: {
        'default.bg': [{ validator: getElementFormValidator(['isBg::内容不正确']), trigger: 'change' }],
        'default.color': [{ validator: getElementFormValidator(['isColorCode::内容不正确']), trigger: 'change' }],
      },
      // 配置项
      articleOptions: [],
      // 当前上传的表单项
      currentUploading: {
        form: null,
        key: '',
      },

      // 原始主题数据
      originPure: [],
      originWallpaper: [],
    };
  },

  created() {
    this.queryConfig();
    this.queryArticle();
  },

  watch: {
    settingJSON: {
      handler(value) {
        this.setting = value;
      },
      immediate: true,
    },
  },

  methods: {
    // 重置配置
    reset() {
      this.$refs.siteForm.resetFields();
      this.$refs.mailForm.resetFields();
      this.$refs.themeForm.resetFields();
      this.$refs.articleForm.resetFields();

      this.theme.pure = this.LODASH.cloneDeep(this.originPure);
      this.theme.wallpaper = this.LODASH.cloneDeep(this.originWallpaper);

      this.$tips('success', '重置配置表单成功', null, 2000);
    },
    // 查询配置
    queryConfig() {
      this.API.findAppConfig({}, { notify: false }).then(res => {
        // 移除表单等待赋值后默认数据更新
        this.loaded = false;

        const { site, mail, theme, article } = res.data;
        // 赋值表单数据
        this.TOOL.mergeByOwnKey(this.site, site);
        this.TOOL.mergeByOwnKey(this.mail, mail);
        this.TOOL.mergeByOwnKey(this.article, article);

        if (this.LODASH.get(theme, 'pure')) this.theme.pure = this.LODASH.get(theme, 'pure');
        if (this.LODASH.get(theme, 'wallpaper')) this.theme.wallpaper = this.LODASH.get(theme, 'wallpaper');

        this.TOOL.mergeByOwnKey(this.theme.default, this.LODASH.get(theme, 'default'));

        this.originPure = this.LODASH.cloneDeep(this.theme.pure);
        this.originWallpaper = this.LODASH.cloneDeep(this.theme.wallpaper);

        // 优先赋值，表单重置方法才能生效
        this.loaded = true;
      });
    },
    // 保存配置
    saveConfig() {
      let list = [];
      list.push(this.checkForm('siteForm'), this.checkForm('mailForm'), this.checkForm('themeForm'), this.checkForm('articleForm'));
      Promise.all(list)
        .then(() => {
          this.API.saveAppConfig(
            {
              systemConfig: JSON.stringify(this.setting, null, 2),
            },
            {
              secret: true,
            },
          ).then(res => {
            this.loaded = false;
            this.originPure = this.LODASH.cloneDeep(this.theme.pure);
            this.originWallpaper = this.LODASH.cloneDeep(this.theme.wallpaper);
            this.$nextTick(() => {
              this.loaded = true;
            });
          });
        })
        .catch(() => {
          this.$tips('error', '校验失败，请检查配置输入项！', null, 2000);
        });
    },

    // 校验转为Promise
    checkForm(formName) {
      return new Promise((resolve, reject) => {
        this.$refs[formName].validate(valid => {
          if (valid) {
            resolve();
          } else reject();
        });
      });
    },

    // 查询文章
    queryArticle() {
      this.API.findArticleByList({}, { notify: false }).then(res => {
        this.articleOptions = res.data.map(item => {
          return {
            label: item.title,
            value: item._id,
          };
        });
      });
    },
    // 校验图片链接
    checkImgUrl(value) {
      let errText = checkParamsByRules([
        {
          value,
          rules: [
            {
              strategy: 'isNoEmpty',
              errMsg: '必填项',
            },
            {
              strategy: 'isImgUrl',
              errMsg: '内容格式不正确',
            },
          ],
        },
      ]);
      return errText;
    },
    // 校验颜色代码
    checkColorCode(value) {
      let errText = checkParamsByRules([
        {
          value,
          rules: [
            {
              strategy: 'isNoEmpty',
              errMsg: '必填项',
            },
            {
              strategy: 'isColorCode',
              errMsg: '内容格式不正确',
            },
          ],
        },
      ]);
      return errText;
    },
    // 添加墙纸
    addTheme(tag) {
      let data;
      switch (tag) {
        case 'pure':
          data = {
            color: '#ffffff',
            background: '#000000',
          };
          break;
        case 'wallpaper':
          data = {
            headerFontColor: '#FFFFFF',
            background: '',
          };
          break;
      }
      if (data) {
        this.theme[tag].push(data);
      }
    },
    // 打开文件选择弹窗
    handleUpload(form, key) {
      // 记录操作的表单项
      this.currentUploading.form = form;
      this.currentUploading.key = key;
      // 唤起文件选择弹窗
      let node = document.getElementById('js-img-picker');
      if (node) node.click();
    },
    // 上传图片
    upload(e) {
      const file = e.target.files[0];
      let formdata = new FormData();
      formdata.append('file', file);
      this.API.uploadFile(formdata, { url: '/manage/upload?type=' + 'img' }).then(res => {
        this.currentUploading.form[this.currentUploading.key] = this.LODASH.get(res.data, '0.path');
        e.target.value = null;
      });
    },
    // 移除墙纸
    removeTheme(tag, data, index) {
      this.theme[tag].splice(index, 1);
    },
    // 设置默认壁纸
    setDefaultTheme(tag, data, index) {
      this.theme.default.bg = data.background;
      this.theme.default.color = tag === 'pure' ? data.color : data.headerFontColor;
    },
  },
};
</script>

<style lang="scss">
.setting {
  .setting-collapse {
    .el-select {
      width: 100%;
    }
    .el-input-group__prepend {
      width: 110px;
      padding-left: 15px;
      padding-right: 10px;
    }
  }
  .pure {
    .el-input__inner {
      padding-left: 38px;
    }
  }
  .wallpaper {
    .el-input__inner {
      padding-left: 38px;
    }
  }
}

.setting-color-picker-popper {
  .el-color-dropdown__btn {
    margin-left: auto;
  }
}
</style>

<style lang="scss" scoped>
.setting {
  width: 100%;
  padding: 10px;
  ::v-deep .error-tip {
    input {
      border-color: var(--red-500);
    }
  }
  ::v-deep .json-edit {
    height: 100%;
    .jsoneditor-vue {
      width: 100%;
      height: 100%;
      .jsoneditor-menu {
        .jsoneditor-modes {
          display: none;
        }
      }
    }
  }
}
</style>
