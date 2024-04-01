<!--
 * @Autor: huasenjio
 * @Date: 2022-09-19 22:14:21
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-04-13 22:47:34
 * @Description: 
-->
<template>
  <HsDrawer :title="'个性定制'" v-bind="$attrs" v-on="$listeners" @contextmenu.native.stop>
    <div class="custom-drawer">
      <el-collapse class="collapse" v-model="activeName" accordion>
        <!-- 基础配置 -->
        <el-collapse-item name="1">
          <template slot="title">
            <div class="title">基础设置</div>
          </template>
          <div class="collapse-content">
            <section class="option">
              <div class="row">
                <div class="left">
                  <div class="left__title">预选引擎</div>
                  <div class="detail">默认选中的搜索引擎</div>
                </div>
                <div class="right">
                  <el-select style="width: 120px" v-model="searchEngineIndex" @change="handleSearchEngineChange">
                    <el-option v-for="item in searchOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                  </el-select>
                </div>
              </div>
              <div class="row">
                <div class="left">
                  <div class="left__title">搜索建议</div>
                  <div class="detail">配置搜索框联想数量</div>
                </div>
                <div class="right">
                  <el-input style="width: 120px" type="number" v-model="associationCount" :max="10" :min="2" @blur="handleBlur"> <template slot="append">个</template> </el-input>
                </div>
              </div>
              <div class="row vertical">
                <div class="left">
                  <div class="left__title">搜索框圆角</div>
                  <div class="detail">控制搜索框的圆角样式</div>
                </div>
                <div class="right px-px-12">
                  <el-slider v-model="searchBorderRadius" :min="0" :max="24" :step="2" show-stops :format-tooltip="val => val + 'px'" @change="handleSearchBorderRadiusChange"> </el-slider>
                </div>
              </div>
              <div class="row">
                <div class="left">
                  <div class="left__title">侧边栏</div>
                  <div class="detail">控制侧边栏显示隐藏</div>
                </div>
                <div class="right">
                  <el-switch v-model="showLeftNavbar" active-text="显示" inactive-text="隐藏" @change="handleNavbar"> </el-switch>
                </div>
              </div>
            </section>
          </div>
        </el-collapse-item>
        <!-- 背景墙 -->
        <el-collapse-item name="2">
          <template slot="title">
            <div class="title">背景墙</div>
          </template>
          <div class="collapse-content">
            <div class="option">
              <div class="row vertical">
                <div class="left">
                  <div class="left__title">背景模糊度</div>
                  <div class="detail">调整背景墙的模糊度</div>
                </div>
                <div class="right px-px-12">
                  <el-slider :show-tooltip="false" :min="0" :max="10" :step="0.5" v-model="sliderFilter" show-stops @change="changeFilter"></el-slider>
                </div>
              </div>
              <div class="row vertical">
                <div class="left">
                  <div class="left__title">遮罩浓度</div>
                  <div class="detail">调整背景墙的明暗</div>
                </div>
                <div class="right px-px-12">
                  <el-slider :show-tooltip="false" :min="0" :max="1" :step="0.1" v-model="sliderLightness" show-stops @change="changeShadow"></el-slider>
                </div>
              </div>
              <div class="row vertical">
                <div class="left">
                  <div class="left__title">纯色背景</div>
                  <div class="detail">选择纯色作为背景墙</div>
                </div>
                <div class="right">
                  <div class="color-block-group">
                    <div class="color-block" v-for="(item, index) in displayPure" :key="index" :style="{ backgroundColor: item.background }" @click="changeBg(item)"></div>
                    <div class="color-block">
                      <el-color-picker v-model="bg" size="mini" @change="changeBg($event, 'pick')"> </el-color-picker>
                    </div>
                  </div>
                </div>
              </div>
              <div class="row vertical">
                <div class="left">
                  <div class="left__title">图片背景</div>
                  <div class="detail">选择图片作为背景墙</div>
                </div>
                <div class="right">
                  <div class="image-group">
                    <div class="image" v-for="(item, index) in displayWallpaperImages" :key="index" :style="{ backgroundImage: `url(${item.background})` }" @click="changeBg(item)">
                      <div class="image__setting">
                        立即设置
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="row vertical">
                <div class="left">
                  <div class="left__title">自定义上传</div>
                  <div class="detail">上传图片作为背景墙</div>
                </div>
                <div class="right">
                  <div class="flex justify-center items-center">
                    <el-upload class="upload pt-px-10" accept=".png,.jpg,.git" :before-upload="beforeUpload" action drag>
                      <i class="el-icon-upload"></i>
                      <div class="el-upload__text">拖拽上传 · <em>点击上传</em></div>
                    </el-upload>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </HsDrawer>
</template>
<script>
import { mapState, mapMutations } from 'vuex';
import HsDrawer from '@/components/content/drawer/Drawer.vue';
import searchs from '@/config/search.config.js';

export default {
  name: 'CustomDrawer',

  components: { HsDrawer },

  data() {
    return {
      show: false,
      activeName: '1',
      // 背景
      bg: '',
      // 控制封面模糊度
      sliderFilter: 0,
      // 控制封面遮罩浓度
      sliderLightness: 0,
      // 搜索联想个数
      associationCount: 6,
      // 搜索框边框圆角
      searchBorderRadius: 24,
      // 预选搜索引擎
      searchEngineIndex: 0,
      // 隐藏左侧
      showLeftNavbar: true,
      // 封面颜色可选纯色系
      pures: [
        {
          color: '#FFFFFF',
          background: '#9CA3AF',
        },
        {
          color: '#FFFFFF',
          background: '#F87171',
        },
        {
          color: '#FFFFFF',
          background: '#FBBF24',
        },
        {
          color: '#FFFFFF',
          background: '#34D399',
        },
        {
          color: '#FFFFFF',
          background: '#60A5FA',
        },
        {
          color: '#FFFFFF',
          background: '#A78BFA',
        },
      ],
      // 壁纸
      wallpaperImages: [
        {
          headerFontColor: '#FFFFFF',
          background: require('@/assets/img/wallpaper/1.jpeg'),
        },
        {
          headerFontColor: '#FFFFFF',
          background: require('@/assets/img/wallpaper/2.jpeg'),
        },
        {
          headerFontColor: '#FFFFFF',
          background: require('@/assets/img/wallpaper/3.jpeg'),
        },
        {
          headerFontColor: '#000000',
          background: require('@/assets/img/wallpaper/4.jpeg'),
        },
        {
          headerFontColor: '#FFFFFF',
          background: require('@/assets/img/wallpaper/5.jpeg'),
        },
        {
          headerFontColor: '#000000',
          background: require('@/assets/img/wallpaper/6.jpeg'),
        },
      ],
    };
  },

  mounted() {
    this.bg = this.user.config.bg;
    this.sliderFilter = this.user.config.bgFilter;
    this.sliderLightness = this.user.config.bgLightness;
    this.associationCount = this.user.config.searchAssociationCount;
    this.searchBorderRadius = this.user.config.searchBorderRadius;
    this.searchEngineIndex = this.user.config.searchEngineIndex;
    this.showLeftNavbar = this.user.config.showNavbar;
  },

  computed: {
    ...mapState(['user', 'themeConfig']),

    displayPure() {
      let pureTemp = this.themeConfig.pure ? this.themeConfig.pure : [];
      let temp = this.pures.concat(pureTemp);
      return [...temp];
    },

    displayWallpaperImages() {
      let wallpaperTemp = this.themeConfig.wallpaper ? this.themeConfig.wallpaper : [];
      let temp = this.wallpaperImages.concat(wallpaperTemp);
      return [...temp];
    },

    searchOptions() {
      return searchs.map((item, index) => {
        return {
          value: index,
          label: item.name,
        };
      });
    },
  },

  methods: {
    ...mapMutations(['commitAll']),

    handleSearchBorderRadiusChange(val) {
      this.initCustomStyle({
        user: {
          config: {
            searchBorderRadius: val,
          },
        },
      });
    },

    handleSearchEngineChange(val) {
      this.initCustomStyle({
        user: {
          config: {
            searchEngineIndex: val,
          },
        },
      });
    },

    handleNavbar(val) {
      this.initCustomStyle({
        user: {
          config: {
            showNavbar: !!val,
          },
        },
      });
    },

    handleBlur() {
      this.associationCount = this.associationCount < 2 || this.associationCount > 10 ? 6 : this.associationCount;
      this.initCustomStyle({
        user: {
          config: {
            searchAssociationCount: this.associationCount,
          },
        },
      });
    },

    changeFilter(val) {
      this.initCustomStyle({
        user: {
          config: {
            bgFilter: val,
          },
        },
      });
    },

    changeShadow(val) {
      this.initCustomStyle({
        user: {
          config: {
            bgLightness: val,
          },
        },
      });
    },

    // 上传文件转换成base64进行保存
    beforeUpload(file) {
      // 1048576 = 1M
      // 2097152 = 2M
      // 3145728 = 3M
      if (file.size <= 2097152) {
        this.TOOL.getBase64(file, bs64 => {
          this.initCustomStyle({
            user: {
              config: {
                bg: bs64,
              },
            },
          });
        });
      } else {
        this.$tips('error', '图片大小已超过 2MB', null, 2000);
      }
      return false; // 终止上传
    },

    changeBg(val, tag) {
      this.initCustomStyle({
        user: {
          config: {
            bg: tag == 'pick' ? val : val.background,
          },
        },
      });
    },

    initCustomStyle(data) {
      this.commitAll(data);
      this.$store.dispatch('snapshoot');
      this.$store.dispatch('initLocalUserInfo');
    },
  },
};
</script>

<style lang="scss" scoped>
.custom-drawer {
  width: 400px;
  margin: 10px auto;
  * {
    box-sizing: border-box;
  }
  .collapse {
    .title {
      padding-left: 10px;
      font-size: 14px;
      box-sizing: border-box;
    }
    .collapse-content {
      .option {
        width: 100%;
        padding: 0px 10px;
        .row {
          display: flex;
          align-items: flex-start;
          margin-top: 10px;
          .left {
            flex: 1;
            .title {
              font-size: 14px;
            }
            .detail {
              font-size: 10px;
              color: var(--gray-400);
            }
          }
          .right {
          }
        }
        .vertical {
          flex-wrap: wrap;
          .right {
            width: 100%;
            .color-block-group {
              display: flex;
              align-items: center;
              flex-wrap: wrap;
              .color-block {
                width: 28px;
                height: 28px;
                margin-right: 8px;
                margin-top: 8px;
                opacity: 0.8;
                border-radius: 4px;
                cursor: pointer;
                &:first-child {
                  margin-left: 0px;
                }
              }
            }
            .image-group {
              display: flex;
              flex-wrap: wrap;
              .image {
                flex-shrink: 0;
                flex-grow: 0;
                width: 180px;
                height: 108px;
                margin: 5px 5px;
                border-radius: 3px;
                display: flex;
                justify-content: center;
                align-items: center;
                background-size: cover;
                background-repeat: no-repeat;
                .image__setting {
                  width: 60px;
                  height: 20px;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  border-radius: 3px;
                  background-color: var(--gray-o5);
                  cursor: pointer;
                }
              }
            }
            .upload {
              ::v-deep .el-upload-dragger {
                width: 380px;
              }
            }
          }
        }
      }
    }
  }
}
</style>
