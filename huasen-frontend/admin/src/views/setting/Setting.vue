<template>
  <div v-if="loaded" class="setting">
    <el-alert title="温馨提示：请您关注官方开源仓库 setting.json 文件，并且及时合并配置项，以确保网站稳定性和体验新功能。" type="info" show-icon> </el-alert>
    <el-collapse class="setting-collapse" v-model="activeNames">
      <!-- 站点配置 -->
      <el-collapse-item name="site">
        <template slot="title"> <i class="el-icon-monitor mr-px-4"></i> 站点配置</template>
        <el-form :model="site" :rules="siteRule" ref="siteForm" class="site-form">
          <el-row :gutter="10">
            <el-col :span="12">
              <el-form-item prop="brandName">
                <el-input size="small" placeholder="请输入品牌名" v-model="site.brandName">
                  <template slot="prepend">品牌名称</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="brandDescription">
                <el-input size="small" placeholder="请输入描述" v-model="site.brandDescription">
                  <template slot="prepend">品牌描述</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="brandKeywords">
                <el-input size="small" placeholder="请输入关键词" v-model="site.brandKeywords">
                  <template slot="prepend">品牌关键词</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="brandUrl">
                <el-input size="small" placeholder="请输入链接" v-model="site.brandUrl">
                  <template slot="prepend">品牌图片</template>
                  <template slot="append">
                    <ImgUpload size="28px" :url="site.brandUrl" @click.native="handleUpload(site, 'brandUrl')"></ImgUpload>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="redirectUrl">
                <el-input size="small" placeholder="请输入重定向地址" v-model="site.redirectUrl">
                  <template slot="prepend">
                    <div class="input__prepend flex items-center justify-between">
                      重定向地址
                      <el-tooltip content="用户访问网站地址错误时，将会自动跳转到该链接。" placement="right">
                        <i class="el-icon-info"></i>
                      </el-tooltip>
                    </div>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="origin">
                <el-input size="small" placeholder="请输入访问源" v-model="site.origin">
                  <template slot="prepend">
                    <div class="input__prepend flex items-center justify-between">
                      访问源
                      <el-tooltip content="用于拼接整站资源访问地址，例如：协议://域名，末尾不用添加/，建议输入值与主站location.origin一致！" placement="bottom">
                        <i class="el-icon-info"></i>
                      </el-tooltip>
                    </div>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="headHtml">
                <el-input size="small" placeholder="添加HTML片段到<head></head>标签中" v-model="site.headHtml">
                  <template slot="prepend">
                    <div class="input__prepend flex items-center justify-between">
                      页头代码
                      <el-tooltip content="该代码将会插入<head></head>中，例如：title、meta、link、style、script、base、noscript等标签，请严格遵守W3C规范！" placement="bottom">
                        <i class="el-icon-info"></i>
                      </el-tooltip>
                    </div>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="bodyHtml">
                <el-input size="small" placeholder="添加HTML片段到<body></body>标签中" v-model="site.bodyHtml">
                  <template slot="prepend">
                    <div class="input__prepend flex items-center justify-between">
                      页体代码
                      <el-tooltip content="该代码将会插入<body></body>中，例如：h1、div、span、img、video等标签，请严格遵守W3C规范！" placement="bottom">
                        <i class="el-icon-info"></i>
                      </el-tooltip>
                    </div>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="footerHtml">
                <el-input size="small" placeholder="添加HTML片段到页脚" v-model="site.footerHtml">
                  <template slot="prepend">页脚代码</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="jwt">
                <el-input size="small" placeholder="请输入令牌密钥" v-model="site.jwt">
                  <template slot="prepend">
                    <div class="input__prepend flex items-center justify-between">
                      令牌密钥
                      <el-tooltip placement="right" content="用户登录凭证加密串，一旦更改，所有用户需要重新登录，请您谨慎修改！">
                        <i class="el-icon-info"></i>
                      </el-tooltip>
                    </div>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="jwtLiveTime">
                <el-input
                  size="small"
                  placeholder="请输入令牌存活时间"
                  @input="value => (site.jwtLiveTime = Number(value.replace(/[^0-9.]/g, '')) || 604800)"
                  v-model="site.jwtLiveTime"
                >
                  <template slot="prepend">
                    <div class="input__prepend flex items-center justify-between">
                      令牌存活时间
                      <el-tooltip content="用户登录凭证有效期，单位：毫秒，例如：1000 * 60 * 60 * 24 * 7 = 604800 = 7天，不宜过小，否则影响用户体验！">
                        <i class="el-icon-info"></i>
                      </el-tooltip>
                    </div>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24"> </el-col>
            <el-col :span="12">
              <el-form-item prop="autoIconPatch">
                <div class="setting__form-item">
                  <div class="setting__form-item__label">
                    网链图标自动补全策略
                    <el-tooltip content="开启状态下，若链接图标未配置或加载失败，则自动请求favicon.im补全显示。" placement="right">
                      <i class="el-icon-info text-gray-600"></i>
                    </el-tooltip>
                  </div>
                  <div class="setting__form-item__value">
                    <el-switch v-model="site.autoIconPatch" active-text="开启" inactive-text="关闭"> </el-switch>
                  </div>
                </div>
              </el-form-item>
              <el-form-item prop="openLabelClassification">
                <div class="setting__form-item">
                  <div class="setting__form-item__label">网链标签分类</div>
                  <div class="setting__form-item__value">
                    <el-switch v-model="site.openLabelClassification" active-text="显示" inactive-text="隐藏"> </el-switch>
                  </div>
                </div>
              </el-form-item>
              <el-form-item prop="cityCode">
                <div class="setting__form-item">
                  <div class="setting__form-item__label">
                    默认城市
                    <el-tooltip content="网站默认显示已选城市的天气信息" placement="right">
                      <i class="el-icon-info text-gray-600"></i>
                    </el-tooltip>
                  </div>
                  <div class="setting__form-item__value">
                    <el-select style="flex: 1" size="small" v-model="site.cityCode" filterable placeholder="请选择城市码">
                      <el-option v-for="(city, index) in cityOptions" :key="index" :label="city.countyname" :value="city.areaid"> </el-option>
                    </el-select>
                  </div>
                </div>
              </el-form-item>
              <el-form-item prop="notifyArticleId">
                <div class="setting__form-item">
                  <div class="setting__form-item__label">
                    公告文章
                    <el-tooltip content="选择已发布文章作为网站公告" placement="right">
                      <i class="el-icon-info text-gray-600"></i>
                    </el-tooltip>
                  </div>
                  <div class="setting__form-item__value">
                    <el-select style="flex: 1" size="small" v-model="site.notifyArticleId" filterable placeholder="请选择">
                      <el-option v-for="(city, index) in articleOptions" :key="index" :label="city.label" :value="city.value"> </el-option>
                    </el-select>
                  </div>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-collapse-item>

      <!-- 主题配置 -->
      <el-collapse-item class="theme" name="theme">
        <template slot="title"> <i class="el-icon-magic-stick mr-px-4"></i>墙纸配置</template>
        <el-form :model="theme" :rules="themeRule" ref="themeForm" class="theme-form">
          <el-row :gutter="10">
            <el-col :span="12">
              <el-form-item prop="default.bg">
                <el-input placeholder="<图片链接 | 颜色代码>" v-model="theme.default.bg">
                  <template slot="prepend">默认背景</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="default.color">
                <el-input placeholder="<颜色代码>" v-model="theme.default.color">
                  <template slot="prepend">默认字体颜色</template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <div class="theme-item pure">
            <div class="px-px-2 text-bold">
              纯色背景列表
              <i class="el-icon-circle-plus text-green-500 pointer" @click="addTheme('pure')"></i>
            </div>
            <ul class="flex overflow-x-auto px-px-2 py-px-6">
              <li v-for="(item, index) in theme.pure" :key="index" class="pure__item flex-shrink-0 relative w-px-184 ml-px-15 first:ml-px-0 shadow p-px-8 rounded">
                <div class="icon__group">
                  <i class="icon__top el-icon-top text-blue-500" title="设为默认" @click="setDefaultTheme('pure', item, index)"></i>
                  <i class="icon__remove el-icon-remove text-red-500" title="移除色块" @click="removeTheme('pure', item, index)"></i>
                  <i v-if="isDefaultTheme('pure', item, index)" class="pure__icon--default el-icon-success text-green-500" title="默认主题"></i>
                </div>
                <el-tooltip :disabled="!!!checkColorCode(item.background)" class="item" effect="light" content="数据格式异常" placement="right">
                  <el-input :class="{ 'error-tip': !!checkColorCode(item.background) }" v-model="item.background" placeholder="背景颜色">
                    <el-color-picker
                      v-model="item.background"
                      class="relative top-px-5 left-px-0"
                      popper-class="setting-color-picker-popper"
                      slot="prefix"
                      size="mini"
                    ></el-color-picker>
                  </el-input>
                </el-tooltip>
                <el-tooltip :disabled="!!!checkColorCode(item.color)" class="item" effect="light" content="数据格式异常" placement="right">
                  <el-input :class="{ 'error-tip': !!checkColorCode(item.color) }" v-model="item.color" class="mt-px-4" placeholder="字体颜色">
                    <el-color-picker
                      v-model="item.color"
                      class="relative top-px-5 left-px-0"
                      popper-class="setting-color-picker-popper"
                      slot="prefix"
                      size="mini"
                    ></el-color-picker>
                  </el-input>
                </el-tooltip>
              </li>
            </ul>
          </div>

          <div class="theme-item wallpaper">
            <div class="px-px-2 text-bold">
              壁纸背景列表
              <i class="el-icon-circle-plus text-green-500 pointer" @click="addTheme('wallpaper')"></i>
            </div>
            <ul class="flex overflow-x-auto px-px-2 py-px-6">
              <li v-for="(item, index) in theme.wallpaper" :key="index" class="wallpaper__item relative flex-shrink-0 w-px-184 ml-px-15 first:ml-px-0 shadow p-px-8 rounded">
                <div class="icon__group">
                  <i class="icon__top el-icon-top text-blue-500" title="设为默认" @click="setDefaultTheme('wallpaper', item, index)"></i>
                  <i class="icon__remove el-icon-remove text-red-500" title="移除壁纸" @click="removeTheme('wallpaper', item, index)"></i>
                  <i v-if="isDefaultTheme('wallpaper', item, index)" class="icon__default el-icon-success text-green-500" title="默认主题"></i>
                </div>
                <div class="w-full h-px-80 mb-px-4 text-center p-px-4 bg-gray-100 border border-dashed border-gray-400 rounded">
                  <img v-lazy="{ unload: require('@/assets/img/error/image-error.png') }" class="max-w-full max-h-full rounded" :src="item.background" />
                </div>
                <el-tooltip :disabled="!!!checkImgUrl(item.background)" class="item" effect="light" content="数据格式异常" placement="right">
                  <el-input :class="{ 'error-tip': !!checkImgUrl(item.background) }" v-model="item.background" placeholder="图片链接">
                    <div
                      slot="prefix"
                      class="w-px-28 h-px-28 p-px-4 relative top-px-5 left-px-0 border border-solid border-gray-300 rounded flex justify-center items-center pointer"
                    >
                      <i class="el-icon-upload text-lg text-gray-600 hover:text-blue-600" @click="handleUpload(item, 'background')"></i>
                    </div>
                  </el-input>
                </el-tooltip>
                <el-tooltip :disabled="!!!checkColorCode(item.headerFontColor)" class="item" effect="light" content="数据格式异常" placement="right">
                  <el-input :class="{ 'error-tip': !!checkColorCode(item.headerFontColor) }" v-model="item.headerFontColor" class="mt-px-4" placeholder="字体颜色">
                    <el-color-picker
                      v-model="item.headerFontColor"
                      class="relative top-px-5 left-px-0"
                      popper-class="setting-color-picker-popper"
                      slot="prefix"
                      size="mini"
                    ></el-color-picker>
                  </el-input>
                </el-tooltip>
              </li>
            </ul>
          </div>
        </el-form>
      </el-collapse-item>

      <!-- 邮箱配置 -->
      <el-collapse-item name="mail">
        <template slot="title"> <i class="el-icon-message mr-px-4"></i>邮箱配置</template>
        <el-form :model="mail" ref="mailForm" class="mail-form">
          <el-row :gutter="10">
            <el-col :span="12">
              <el-form-item prop="host">
                <el-input placeholder="<主机>" v-model="mail.host">
                  <template slot="prepend">host</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="port">
                <el-input placeholder="<端口>" @input="value => (mail.port = Number(value.replace(/[^0-9.]/g, '')) || 465)" v-model="mail.port">
                  <template slot="prepend">port</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="user">
                <el-input placeholder="<用户>" v-model="mail.user">
                  <template slot="prepend">user</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="mtp">
                <el-input placeholder="<通行码>" v-model="mail.mtp">
                  <template slot="prepend">mtp</template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-collapse-item>
      <!-- 配置总览 -->
      <el-collapse-item name="code">
        <template slot="title">
          <div class="flex items-center"><i class="el-icon-table-lamp mr-px-4"></i>配置代码总览<font class="text-red-500"></font></div>
        </template>
        <el-alert title="点击「SAVE」保存手动修改的配置代码，需要注意，您的输入不会被校验，请确保正确性，否则网站无法启动！" type="warning" show-icon :closable="false"> </el-alert>
        <el-row class="mt-px-8" :gutter="10">
          <el-col :span="24">
            <div class="result">
              <VueJsonEditor
                class="json-edit"
                v-model="setting"
                :show-btns="true"
                :expandedOnStart="true"
                mode="view"
                :modes="['code', 'view']"
                @json-save="handleJSONSave"
              ></VueJsonEditor>
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
    <input style="display: none" id="js-img-picker" @change="upload($event)" accept="image/gif,image/jpeg,image/jpg,image/png,image/svg+xml" type="file" />
  </div>
</template>

<script>
import ImgUpload from '@/components/common/img-upload/ImgUpload.vue';
import VueJsonEditor from 'vue-json-editor-fix-cn';
import { Validator } from 'huasen-lib';
const validator = new Validator();
const checkParamsByRules = validator.verify.bind(validator);
const getElementFormValidator = validator.getElementFormValidator.bind(validator);

export default {
  name: 'Setting',

  components: { VueJsonEditor, ImgUpload },

  data() {
    return {
      loaded: false,
      activeNames: ['site', 'theme', 'mail', 'code'],
      site: {
        brandName: '花森',
        brandUrl: 'https://n.huasenjio.top/huasen-store/icon/logo.png',
        brandDescription:
          '花森起始页由可自定义网址导航、文章博客、后台管理模块组成的开源项目，专注于收录互联网优秀站点，涵盖了生活、娱乐、学习、影视、考研、工作、科技、工具等领域，提供一个信息聚合的空间，让用户高效上网冲浪的综合性平台！',
        brandKeywords: 'huasenjio.top,花森起始页,花森主页,花森导航,花森博客,花生起始页,花生主页,花生网址导航,花生博客,综合门户,网址导航,实用工具',
        redirectUrl: 'https://huasenjio.top/',
        origin: '',
        headHtml: '',
        bodyHtml: '',
        footerHtml: '',
        openLabelClassification: false,
        autoIconPatch: false,
        jwt: 'abcdefghyjklmnobqrstuvwhyz123456',
        jwtLiveTime: 604800,
        cityCode: 101210101,
        notifyArticleId: null,
      },
      siteRule: {
        redirectUrl: [{ validator: getElementFormValidator(['isUrl::链接格式不正确']) }],
        jwt: [
          { validator: getElementFormValidator(['minLength:32::请输入32个字符', 'maxLength:32::请输入32个字符']) },
          {
            validator: (rule, value, callback) => {
              if (value !== '' && !/^[0-9a-zA-Z]+$/.test(value)) {
                callback(new Error('仅支持字母/数字组合'));
              }
              callback();
            },
          },
        ],
      },
      mail: {
        host: 'smtp.qq.com',
        port: 465,
        user: 'test@qq.com',
        mtp: '',
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
          order: -1,
          bg: '',
          color: '',
        },
      },
      themeRule: {
        'default.color': [{ validator: getElementFormValidator(['isColor::内容不正确']) }],
      },
      cityOptions: [],
      articleOptions: [],
      currentUploading: {
        form: null,
        key: '',
      },
      originPure: [],
      originWallpaper: [],
      settingKeys: [],
    };
  },

  activated() {
    this.queryCity();
    this.queryConfig();
    this.queryArticle();
  },

  computed: {
    setting: {
      get() {
        let keys = this.settingKeys || [];
        let json = {};
        for (let key of keys) {
          json[key] = this[key];
        }
        return json;
      },
      set(val) {},
    },
  },

  methods: {
    /**
     * 判断是否为默认主题
     * @param type - 主题数据类型，例如：pure | wallpaper
     * @param item - 主题数据
     * @param index - 主题数据索引
     */
    isDefaultTheme(type, item, index) {
      if (type === 'pure') {
        return this.theme.default.bg === item.background && this.theme.default.color === item.color && this.theme.default.order === index;
      } else if (type === 'wallpaper') {
        return this.theme.default.bg === item.background && this.theme.default.color === item.headerFontColor && this.theme.default.order === index;
      }
    },

    /**
     * 保存配置代码
     * @param {Object} json - json数据
     */
    handleJSONSave(json) {
      this.$confirm('该操作将忽略上面所有表单输入项，并且保存编辑器中的代码作为最新配置，您确定吗？', '保存配置代码', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          let that = this;
          this.settingKeys = Object.keys(json);
          for (let key of this.settingKeys) {
            if (['site', 'mail', 'theme'].includes(key)) {
              // 对于表单输入项，采取同名覆盖策略，忽略undefined
              this.TOOL.overrideKeys(that[key], json[key]);
            } else {
              that[key] = json[key];
            }
          }
          this.saveConfig();
        })
        .catch(() => {});
    },

    /**
     * 重置配置
     */
    reset() {
      this.$refs.siteForm.resetFields();
      this.$refs.mailForm.resetFields();
      this.$refs.themeForm.resetFields();
      this.theme.pure = this.LODASH.cloneDeep(this.originPure);
      this.theme.wallpaper = this.LODASH.cloneDeep(this.originWallpaper);
      this.$tips('success', '重置配置成功', null, 2000);
    },

    /**
     * 查询城市信息
     */
    queryCity() {
      this.API.app.getCity({}, { notify: false }).then(res => {
        this.cityOptions = res.data;
      });
    },

    /**
     * 查询配置
     */
    queryConfig() {
      this.API.app.findAppConfig({}, { notify: false }).then(res => {
        this.loaded = false;
        this.settingKeys = Object.keys(res.data);
        for (let key of this.settingKeys) {
          this[key] = res.data[key];
        }
        this.originPure = this.LODASH.cloneDeep(this.theme.pure);
        this.originWallpaper = this.LODASH.cloneDeep(this.theme.wallpaper);
        this.loaded = true;
      });
    },

    /**
     * 保存配置
     */
    saveConfig() {
      let list = [];
      list.push(this.checkForm('siteForm'), this.checkForm('mailForm'), this.checkForm('themeForm'));
      Promise.all(list)
        .then(() => {
          this.API.app
            .saveAppConfig(
              {
                systemConfig: JSON.stringify(this.setting, null, 2),
              },
              {
                secret: 'rsa',
              },
            )
            .then(res => {
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

    /**
     * 校验表单
     * @param formName - 表单名称
     */
    checkForm(formName) {
      return new Promise((resolve, reject) => {
        this.$refs[formName].validate(valid => {
          if (valid) {
            resolve();
          } else reject();
        });
      });
    },

    /**
     * 查询文章列表
     */
    queryArticle() {
      this.API.article.findArticleByList({}, { notify: false, secret: 'rsa' }).then(res => {
        this.articleOptions = res.data.map(item => {
          return {
            label: item.title,
            value: item._id,
          };
        });
      });
    },

    /**
     * 校验图片链接
     * @param value - 图片链接
     */
    checkImgUrl(value) {
      let errText = checkParamsByRules([
        {
          value,
          rules: [
            {
              strategy: 'isNonEmpty',
              errMsg: '必填项',
            },
          ],
        },
      ]);
      return errText;
    },

    /**
     * 校验颜色代码
     * @param value - 颜色代码
     */
    checkColorCode(value) {
      let errText = checkParamsByRules([
        {
          value,
          rules: [
            {
              strategy: 'isNonEmpty',
              errMsg: '必填项',
            },
            {
              strategy: 'isColor',
              errMsg: '内容格式不正确',
            },
          ],
        },
      ]);
      return errText;
    },

    /**
     * 添加主题
     * @param tag - 主题类型，例如：pure | wallpaper
     */
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

    /**
     * 打开文件选择弹窗
     * @param form - 表单对象
     * @param key - 表单对象的key
     */
    handleUpload(form, key) {
      // 记录操作的表单项
      this.currentUploading.form = form;
      this.currentUploading.key = key;
      // 唤起文件选择弹窗
      let node = document.getElementById('js-img-picker');
      if (node) node.click();
    },

    /**
     * 上传图片
     * @param {Object} e - 事件对象
     */
    upload(e) {
      const file = e.target.files[0];
      let formdata = new FormData();
      formdata.append('file', file);
      this.API.file.uploadFile(formdata, { url: '/file/upload?type=' + 'img' }).then(res => {
        this.currentUploading.form[this.currentUploading.key] = this.LODASH.get(res.data, '0.path');
        e.target.value = null;
      });
    },

    /**
     * 移除墙纸
     * @param tag
     * @param data
     * @param index
     */
    removeTheme(tag, data, index) {
      this.theme[tag].splice(index, 1);
    },

    /**
     * 设置默认壁纸
     * @param tag
     * @param data
     * @param index
     */
    setDefaultTheme(tag, data, index) {
      this.theme.default.order = index;
      this.theme.default.bg = data.background;
      this.theme.default.color = tag === 'pure' ? data.color : data.headerFontColor;
    },
  },
};
</script>

<style lang="scss" scoped>
.setting {
  width: 100%;
  padding: 10px;
  .setting__form-item {
    display: flex;
    align-items: center;
    padding-bottom: 4px;
    .setting__form-item__label {
      width: 180px;
      height: 36px;
      display: flex;
      align-items: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      word-break: break-all;
      i {
        margin-left: 4px;
      }
    }
    .setting__form-item__value {
      flex: 1;
      display: flex;
      align-items: center;
      white-space: nowrap;
      overflow: hidden;
      margin-left: 20px;
    }
  }
  .theme {
    .theme-item {
      position: relative;
      & > ul > li {
        &:hover {
          .icon__top {
            display: block !important;
          }
          .icon__remove {
            display: block !important;
          }
        }
      }
      .icon__group {
        position: absolute;
        top: -6px;
        right: -6px;
        z-index: 10;
        display: flex;
        .icon__top {
          display: none;
        }
        .icon__remove {
          display: none;
        }
        i {
          margin-left: 6px;
          cursor: pointer;
        }
      }
    }
  }
  ::v-deep .error-tip {
    input {
      border-color: var(--red-500);
    }
  }
  ::v-deep .json-edit {
    height: calc(100vh - 180px);
    .jsoneditor-vue {
      width: 100%;
      height: 100%;
      .jsoneditor-menu {
        .jsoneditor-modes {
          // display: none;
        }
      }
    }
    .jsoneditor-btns {
      .json-save-btn {
        position: absolute;
        height: 26px;
        top: 5px;
        left: 146px;
        padding: 2px 10px;
        border-radius: 2px;
        border: 1px solid transparent;
        background-color: transparent;
        opacity: 0.8;
        &:hover {
          border: 1px solid #8db8fd;
          background-color: #5a98fb;
        }
      }
    }
  }
}
</style>

<style lang="scss">
.setting {
  .setting-collapse {
    .el-select {
      width: 100%;
    }
    .el-input-group__prepend {
      width: 120px;
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
