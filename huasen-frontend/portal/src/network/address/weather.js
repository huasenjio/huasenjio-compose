import Mock from 'mockjs2';
import { get, post } from '../request.js';

// 获取邮箱验证码
const getWeatherByCityCode = get(
  '/weather/getWeatherByCityCode',
  {
    cityCode: undefined,
    cityName: '未知地区',
    provinceName: '中国',
    img: '0',
    time: '1979-01-01 00:00:00',
    weather: '晴',
    maxTemp: '99',
    minTemp: '-99',
    ziWaiXian: 'N/A',
    fengSu: '2级',
    fengXiang: '东南风',
    shiDu: '86'
  },
  false,
);

export default {
  getWeatherByCityCode,
};
