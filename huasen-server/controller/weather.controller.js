/*
 * @Autor: huasenjio
 * @Date: 2022-10-22 15:29:02
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-22 15:43:31
 * @Description: 天气控制器
 */
const _ = require('lodash');
const request = require('request');

async function getWeatherByCityCode(req, res, next) {
  const defaultData = {
    cityCode: undefined,
    cityName: '未知地区',
    provinceName: '中国',
    img: '0',
    time: '1979-01-01 00:00:00',
    weather: '晴',
    quality: '优',
    maxTemp: '99',
    minTemp: '-99',
    ziWaiXian: 'N/A',
    fengSu: '2级',
    fengXiang: '东南风',
    shiDu: '86'
  }
  try {
    const { cityId } = req.huasenParams
    request.get({ url: `http://aider.meizu.com/app/weather/listWeather?cityIds=${cityId}`, timeout: 6000, encoding: 'utf-8' }, (error, response, body) => {
      if (error || response.statusCode !== 200) {
        global.huasen.responseData(res, defaultData, 'ERROR', '获取天气信息失败', false);
      } else {
        const weather = JSON.parse(body).value[0]
        if (weather) {
          const data = {
            cityCode: cityId,
            cityName: _.get(weather, 'city') || defaultData.cityName,
            provinceName: _.get(weather, 'provinceName') || defaultData.provinceName,
            img: _.get(weather, 'realtime.img') || defaultData.img,
            time: _.get(weather, 'realtime.time') || defaultData.time,
            weather: _.get(weather, 'realtime.weather') || defaultData.weather,
            quality: _.get(weather, 'pm25.quality'),
            maxTemp: _.get(weather, 'realtime.sendibleTemp') || defaultData.maxTemp,
            minTemp: _.get(weather, 'realtime.temp') || defaultData.minTemp,
            ziWaiXian: _.get(weather, 'realtime.ziwaixian') || defaultData.ziWaiXian,
            fengSu: _.get(weather, 'realtime.wS') || defaultData.fengSu,
            fengXiang: _.get(weather, 'realtime.wD') || defaultData.fengXiang,
            shiDu: _.get(weather, 'realtime.sD') || defaultData.shiDu,
          }
          global.huasen.responseData(res, data, 'SUCCESS', '获取天气信息成功', false);
        } else {
          global.huasen.responseData(res, defaultData, 'ERROR', '该地区暂不支持查询天气', false);
        }


      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getWeatherByCityCode,
};
