/*
 * @Description: 授权接口
 */
import { post } from '../request.js';

const getAdvancedStatus = post('/license/advanced/status');

export default {
  getAdvancedStatus,
};
