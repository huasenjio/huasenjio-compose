const Mock = require('mockjs2');
import { get, post } from '../request.js';

const pinORM = Mock.mock({
  _id: '@id',
  name: '@cname',
  color: '@color',
});

const findByPage = post(
  '/pin/findByPage',
  {
    code: 200,
    data: {
      list: [pinORM],
      total: 1,
    },
    msg: '请求成功',
  },
  false,
);
const removePin = post(
  '/pin/removePin',
  {
    code: 200,
    data: null,
    msg: '请求成功',
  },
  false,
);

const findByList = get(
  '/pin/findByList',
  {
    code: 200,
    data: [pinORM],
    msg: '请求成功',
  },
  false,
);

const addPin = post(
  '/pin/addPin',
  {
    code: 200,
    data: pinORM,
    msg: '请求成功',
  },
  false,
);

const removeManyPins = post(
  '/pin/removeManyPins',
  {
    code: 200,
    data: null,
    msg: '请求成功',
  },
  false,
);

const updatePin = post(
  '/pin/updatePin',
  {
    code: 200,
    data: pinORM,
    msg: '请求成功',
  },
  false,
);

export { findByList, findByPage, removePin, addPin, removeManyPins, updatePin };
