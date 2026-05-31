import { get, post, upload } from '../request.js';
import { Config } from '../request.js';

const isDev = process.env.NODE_ENV === 'development';
// 开发环境下 SSE 流必须直连后端，绕过 webpack dev server 代理，否则代理层可能无法正确传播客户端 abort，导致后端收不到连接断开事件。
const chatStreamUrl = isDev ? 'http://localhost:3000/ai/user/chat/stream' : `${Config.baseURL}/ai/user/chat/stream`;

const findEnabledApps = post('/ai/user/app/list');
const findKnowledgePackList = post('/ai/user/knowledge-pack/list');
const findConversationByPage = post('/ai/user/conversation/findByPage');
const createConversation = post('/ai/user/conversation/create');
const findMessageByConversation = post('/ai/user/message/findByConversation');
const removeConversation = post('/ai/user/conversation/remove');
const removeMessages = post('/ai/user/message/remove');
const uploadAttachment = upload('/ai/user/attachment/upload');
const getAcceptTypes = get('/ai/manage/acceptTypes');

export default {
  findEnabledApps,
  findKnowledgePackList,
  findConversationByPage,
  createConversation,
  findMessageByConversation,
  removeConversation,
  removeMessages,
  uploadAttachment,
  chatStreamUrl,
  getAcceptTypes,
};
