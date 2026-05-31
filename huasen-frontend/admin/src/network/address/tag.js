const Mock = require('mockjs2');
import { get, post } from '../request.js';

const tagORM = Mock.mock({
  _id: '@id',
  name: '@cname',
});

const findByList = get(
  '/tag/findByList',
  {
    code: 200,
    data: [tagORM],
    msg: '请求成功',
  },
  false,
);

const findByPage = post(
  '/tag/findByPage',
  {
    code: 200,
    data: {
      list: [tagORM],
      total: 1,
    },
    msg: '请求成功',
  },
  false,
);

const addTag = post(
  '/tag/addTag',
  {
    code: 200,
    data: tagORM,
    msg: '请求成功',
  },
  false,
);

const removeTag = post(
  '/tag/removeTag',
  {
    code: 200,
    data: null,
    msg: '请求成功',
  },
  false,
);

const removeManyTags = post(
  '/tag/removeManyTags',
  {
    code: 200,
    data: null,
    msg: '请求成功',
  },
  false,
);

const updateTag = post(
  '/tag/updateTag',
  {
    code: 200,
    data: tagORM,
    msg: '请求成功',
  },
  false,
);

export { findByList, findByPage, addTag, removeTag, removeManyTags, updateTag };
