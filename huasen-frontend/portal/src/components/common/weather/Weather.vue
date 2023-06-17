<!--
 * @Autor: huasenjio
 * @Date: 2021-10-31 10:52:35
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-19 21:22:37
 * @Description: 
-->
<template>
  <div v-show="showWeather" id="hs-weather">
    <div id="he-plugin-simple"></div>
  </div>
</template>
<script>
export default {
  name: 'Weather',
  data() {
    return {
      showWeather: true,
    };
  },
  mounted() {
    window.WIDGET = {
      CONFIG: {
        modules: '12034',
        background: 5,
        tmpColor: 'E4C600',
        tmpSize: 14,
        cityColor: 'E4C600',
        citySize: 14,
        aqiColor: '#E4C600',
        aqiSize: 14,
        weatherIconSize: 24,
        alertIconSize: 18,
        padding: '0px 0px 0px 0px',
        shadow: '1',
        language: 'auto',
        borderRadius: 5,
        fixed: 'false',
        vertical: 'middle',
        horizontal: 'left',
        key: 'e05c4ce44b7e43c6a9303e68cc42a48c',
      },
    };
    this.TOOL.getCDN('https://widget.qweather.net/simple/static/js/he-simple-common.js?v=2.0', 'text/javascript', () => {
      this.$nextTick(() => {
        let dom = document.getElementById('hs-weather');
        if (!this.chartObserve) {
          this.chartObserve = new ResizeObserver(([{ contentRect }]) => {
            if (contentRect.width === 0) return;
            // 避免过长，影响布局的情况
            this.showWeather = contentRect.width > 180 ? false : true;
          });
          this.chartObserve.observe(dom);
          this.$once('hook:beforeDestroy', function() {
            this.chartObserve.unobserve(dom);
          });
        }
      });
    });
  },
};
</script>

<style lang="scss" scoped>
#hs-weather {
  max-width: 185px;
  pointer-events: none;
}
</style>
