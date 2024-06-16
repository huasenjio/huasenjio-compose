<!--
 * @Autor: huasenjio
 * @Date: 2021-10-31 10:52:35
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-19 21:22:37
 * @Description: 
-->
<template>
  <div v-show="showWeather && loaded" id="hs-weather" class="flex items-center">
    <div class="city text" :title="weather.cityName">{{ weather.cityName }}</div>
    <div class="icon" :style="iconStyle"></div>
    <div class="weather text" :title="weather.weather">{{ weather.weather }}</div>
    <div class="temp text" :title="weather.minTemp + '°C'">{{ weather.minTemp + '°C' }}</div>
    <div class="quality text" :title="weather.quality">{{ weather.quality }}</div>
    <!-- <div id="he-plugin-simple"></div> -->
  </div>
</template>
<script>
import { mapState } from 'vuex';
import { AF } from '@/plugin/AF.js';
const af = new AF(this, 200);

const imgDaytimeMap = {
  '0': require('@/assets/img/weather/tianqiicon_qingtian_baitian.png'), // 晴
  '1': require('@/assets/img/weather/tianqiicon_duoyun_baitian.png'), // 多云
  '2': require('@/assets/img/weather/tianqiicon_yintian.png'), // 阴
  '3': require('@/assets/img/weather/tianqiicon_zhenyu_baitian.png'), // 阵雨
  '4': require('@/assets/img/weather/tianqiicon_leidian.png'), // 雷阵雨
  '7': require('@/assets/img/weather/tianqiicon_xiaoyu.png'), // 小雨
  '8': require('@/assets/img/weather/tianqiicon_zhongyu.png'), // 中雨
  '10': require('@/assets/img/weather/tianqiicon_dayu.png'), // 大雨
  '18': require('@/assets/img/weather/tianqiicon_wu.png'), // 雾霾
};
const imgNightMap = {
  '0': require('@/assets/img/weather/tianqiicon_qingtian_heiye.png'), // 晴
  '1': require('@/assets/img/weather/tianqiicon_duoyun_heiye.png'), // 多云
  '2': require('@/assets/img/weather/tianqiicon_yintian.png'), // 阴
  '3': require('@/assets/img/weather/tianqiicon_zhenyu_heiye.png'), // 阵雨
  '4': require('@/assets/img/weather/tianqiicon_leidian.png'), // 雷阵雨
  '7': require('@/assets/img/weather/tianqiicon_xiaoyu.png'), // 小雨
  '8': require('@/assets/img/weather/tianqiicon_zhongyu.png'), // 中雨
  '10': require('@/assets/img/weather/tianqiicon_dayu.png'), // 大雨
  '18': require('@/assets/img/weather/tianqiicon_wu.png'), // 雾霾
};

export default {
  name: 'Weather',
  data() {
    return {
      loaded: false,
      showWeather: true,
      imgDaytimeMap,
      weather: {},
    };
  },
  computed: {
    ...mapState(['user']),

    // 判断白天黑夜
    isDaytime() {
      const hours = new Date().getHours();
      // 假设白天时间为早上6点到晚上6点
      const dayStart = 6; // 6 AM
      const dayEnd = 18; // 6 PM
      if (hours >= dayStart && hours < dayEnd) {
        return true; // 白天
      } else {
        return false; // 黑夜
      }
    },

    iconStyle() {
      let iconMap = this.isDaytime ? imgDaytimeMap : imgNightMap;
      return {
        backgroundImage: `url(${iconMap[this.weather.img] || iconMap[0]})`,
      };
    },
  },

  watch: {
    'user.config.cityCode': {
      handler(nV, oV) {
        af.run(() => {
          this.queryWeather();
        });
      },
      immediate: true,
    },
  },
  mounted() {
    // 和风天气API停止维护
    // window.WIDGET = {
    //   CONFIG: {
    //     modules: '12034',
    //     background: 5,
    //     tmpColor: 'E4C600',
    //     tmpSize: 14,
    //     cityColor: 'E4C600',
    //     citySize: 14,
    //     aqiColor: '#E4C600',
    //     aqiSize: 14,
    //     weatherIconSize: 24,
    //     alertIconSize: 18,
    //     padding: '0px 0px 0px 0px',
    //     shadow: '1',
    //     language: 'auto',
    //     borderRadius: 5,
    //     fixed: 'false',
    //     vertical: 'middle',
    //     horizontal: 'left',
    //     key: 'e05c4ce44b7e43c6a9303e68cc42a48c',
    //   },
    // };
    // this.TOOL.getCDN('https://widget.qweather.net/simple/static/js/he-simple-common.js?v=2.0', 'text/javascript', () => {
    //   this.$nextTick(() => {
    //     let dom = document.getElementById('hs-weather');
    //     if (!this.chartObserve) {
    //       this.chartObserve = new ResizeObserver(([{ contentRect }]) => {
    //         if (contentRect.width === 0) return;
    //         // 避免过长，影响布局的情况
    //         this.showWeather = contentRect.width > 200 ? false : true;
    //       });
    //       this.chartObserve.observe(dom);
    //       this.$once('hook:beforeDestroy', function() {
    //         this.chartObserve.unobserve(dom);
    //       });
    //     }
    //   });
    // });
  },

  methods: {
    queryWeather() {
      this.loaded = false;
      if (this.user.config.cityCode) {
        this.API.getWeatherByCityCode(
          { cityId: this.user.config.cityCode },
          {
            notify: false,
          },
        ).then(res => {
          this.loaded = true;
          this.weather = res.data;
          console.log('天气信息：', res.data);
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
#hs-weather {
  max-width: 228px;
  display: flex;
  align-items: center;
  .city {
    max-width: 70px;
  }
  .icon {
    width: 20px;
    height: 20px;
    margin-left: 3px;
    background-position: center center;
    background-size: 100% 100%;
  }
  .weather {
    max-width: 42px;
    margin-left: 3px;
  }
  .temp {
    max-width: 42px;
    margin-left: 3px;
  }
  .quality {
    max-width: 42px;
    margin-left: 3px;
  }
}

@media only screen and (max-width: 1024px) {
  #hs-weather {
    .weather {
      display: none;
    }
  }
}
</style>
