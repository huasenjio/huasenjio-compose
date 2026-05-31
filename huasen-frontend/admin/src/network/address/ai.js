const Mock = require('mockjs2');
import { get, post } from '../request.js';

const providerORM = Mock.mock({
  _id: '@id',
  name: '@ctitle(2,4)',
  providerType: '@pick(["qwen","deepseek","kimi","siliconflow","camel"])',
  baseUrl: '@url',
  apiKey: '@guid',
  enabled: '@boolean',
  remarks: '@cparagraph(1,2)',
  supportsImageInput: '@boolean',
  supportsDocumentInline: '@boolean',
  supportsTextFallback: '@boolean',
  extraConfig: '{}',
  sort: '@integer(0,10)',
});

const appORM = Mock.mock({
  _id: '@id',
  name: '@ctitle(2,4)',
  code: '@integer(0,3)',
  description: '@cparagraph(1,2)',
  icon: '@url',
  providerId: '@id',
  presetId: '@id',
  welcomeText: '@csentence(8,16)',
  enabled: true,
  sort: '@integer(0,10)',
});

const presetORM = Mock.mock({
  _id: '@id',
  name: '@ctitle(2,4)',
  appId: '@id',
  providerId: '@id',
  model: '@word(4,10)',
  promptTemplate: '@cparagraph(1,2)',
  params: '{}',
  temperature: 0.7,
  maxTokens: 2048,
  topP: 1,
  allowImage: true,
  allowFile: true,
  imageAsBase64: false,
  maxContextMessages: '@integer(6,20)',
  enabled: true,
  isDefault: false,
  sort: '@integer(0,10)',
});

const knowledgePackORM = Mock.mock({
  _id: '@id',
  name: '@ctitle(2,4)',
  description: '@cparagraph(1,2)',
  appIds: [],
  articleIds: ['@id'],
  appNames: [],
  articleTitles: ['@ctitle(6,12)'],
  code: '@integer(0,3)',
  maxArticles: 5,
  maxKnowledgeChars: 100000,
  enabled: true,
});

const conversationORM = Mock.mock({
  _id: '@id',
  userId: '@id',
  appId: '@id',
  presetId: '@id',
  title: '@ctitle(4,12)',
  summary: '@cparagraph(1,2)',
  source: '@pick(["portal","plugin"])',
  lastMessageAt: '@datetime',
  messageCount: '@integer(0,20)',
  enabled: true,
  creatTime: '@datetime',
  updateTime: '@datetime',
});

const messageORM = Mock.mock({
  _id: '@id',
  conversationId: '@id',
  appId: '@id',
  presetId: '@id',
  providerId: '@id',
  role: '@pick(["system","user","assistant"])',
  content: '@cparagraph(1,3)',
  contentType: 'text',
  attachmentIds: [],
  model: '@word(4,10)',
  usage: '{}',
  finishReason: '',
  status: 'success',
  errorMessage: '',
  rawResponse: '{}',
  attachments: [
    {
      _id: '@id',
      name: '@ctitle(4,8).pdf',
      url: '@url',
      mimeType: 'application/pdf',
      size: '@integer(1024,1048576)',
      kind: 'file',
    },
  ],
  enabled: true,
  creatTime: '@datetime',
  updateTime: '@datetime',
});

const findProviderByList = post('/ai/manage/provider/list', { code: 200, data: [providerORM], msg: '请求成功' }, false);
const findProviderByPage = post('/ai/manage/provider/findByPage', { code: 200, data: { list: [providerORM], total: 1 }, msg: '请求成功' }, false);
const addProvider = post('/ai/manage/provider/add', { code: 200, data: [providerORM], msg: '请求成功' }, false);
const updateProvider = post('/ai/manage/provider/update', { code: 200, data: providerORM, msg: '请求成功' }, false);
const removeProvider = post('/ai/manage/provider/remove', { code: 200, data: null, msg: '请求成功' }, false);

const findAppByList = post('/ai/manage/app/list', { code: 200, data: [appORM], msg: '请求成功' }, false);
const findAppByPage = post('/ai/manage/app/findByPage', { code: 200, data: { list: [appORM], total: 1 }, msg: '请求成功' }, false);
const addApp = post('/ai/manage/app/add', { code: 200, data: [appORM], msg: '请求成功' }, false);
const updateApp = post('/ai/manage/app/update', { code: 200, data: appORM, msg: '请求成功' }, false);
const removeApp = post('/ai/manage/app/remove', { code: 200, data: null, msg: '请求成功' }, false);

const findPresetByList = post('/ai/manage/preset/list', { code: 200, data: [presetORM], msg: '请求成功' }, false);
const findPresetByPage = post('/ai/manage/preset/findByPage', { code: 200, data: { list: [presetORM], total: 1 }, msg: '请求成功' }, false);
const addPreset = post('/ai/manage/preset/add', { code: 200, data: [presetORM], msg: '请求成功' }, false);
const updatePreset = post('/ai/manage/preset/update', { code: 200, data: presetORM, msg: '请求成功' }, false);
const removePreset = post('/ai/manage/preset/remove', { code: 200, data: null, msg: '请求成功' }, false);

const findKnowledgePackByList = post('/ai/manage/knowledge-pack/list', { code: 200, data: [knowledgePackORM], msg: '请求成功' }, false);
const findKnowledgePackByPage = post('/ai/manage/knowledge-pack/findByPage', { code: 200, data: { list: [knowledgePackORM], total: 1 }, msg: '请求成功' }, false);
const addKnowledgePack = post('/ai/manage/knowledge-pack/add', { code: 200, data: [knowledgePackORM], msg: '请求成功' }, false);
const updateKnowledgePack = post('/ai/manage/knowledge-pack/update', { code: 200, data: knowledgePackORM, msg: '请求成功' }, false);
const removeKnowledgePack = post('/ai/manage/knowledge-pack/remove', { code: 200, data: null, msg: '请求成功' }, false);

const findUserAppList = post('/ai/user/app/list', { code: 200, data: [appORM], msg: '请求成功' }, false);
const findConversationByPage = post('/ai/user/conversation/findByPage', { code: 200, data: { list: [], total: 0 }, msg: '请求成功' }, false);
const createConversation = post('/ai/user/conversation/create', { code: 200, data: [], msg: '请求成功' }, false);
const findMessageByConversation = post('/ai/user/message/findByConversation', { code: 200, data: [], msg: '请求成功' }, false);
const removeConversation = post('/ai/user/conversation/remove', { code: 200, data: null, msg: '请求成功' }, false);
const findManageConversationByPage = post('/ai/manage/conversation/findByPage', { code: 200, data: { list: [conversationORM], total: 1 }, msg: '请求成功' }, false);
const findManageMessageByConversation = post('/ai/manage/message/findByConversation', { code: 200, data: [messageORM], msg: '请求成功' }, false);
const removeManageConversation = post('/ai/manage/conversation/remove', { code: 200, data: null, msg: '请求成功' }, false);
const removeManyManageConversation = post('/ai/manage/conversation/removeMany', { code: 200, data: null, msg: '请求成功' }, false);
const userChat = post('/ai/user/chat', { code: 200, data: {}, msg: '请求成功' }, false);

const getAcceptTypes = post('/ai/manage/acceptTypes', { code: 200, data: {}, msg: '请求成功' }, false);

// 授权
const activateLicense = post('/license/activate', { code: 200, data: { type: 'yearly', expireAt: '@datetime', abilities: [] }, msg: '请求成功' }, false);
const getLicenseStatus = post('/license/status', { code: 200, data: { authorized: false, license: null, reason: '', message: '' }, msg: '请求成功' }, false);
const syncLicense = post('/license/sync', { code: 200, data: { updated: true }, msg: '请求成功' }, false);

// AI 插件
const pluginStatus = post(
  '/ai/plugin/status',
  { code: 200, data: { authorized: false, reason: '', message: '', license: null, source: '', version: '', abilities: [] }, msg: '请求成功' },
  false,
);

// AI 能力
const abilityORM = Mock.mock({
  _id: '@id',
  abilityCode: '@word(6,12)',
  name: '@ctitle(4,8)',
  icon: 'el-icon-magic-stick',
  appId: '@id',
  defaultResponseFormat: '@pick(["text","json_object"])',
  defaultPrompt: '@cparagraph(1,2)',
  enabled: true,
  code: 0,
  sort: '@integer(0,10)',
});
const findAbilityByList = post('/ai/manage/ability/list', { code: 200, data: [abilityORM], msg: '请求成功' }, false);
const findAbilityByPage = post('/ai/manage/ability/findByPage', { code: 200, data: { list: [abilityORM], total: 1 }, msg: '请求成功' }, false);
const updateAbility = post('/ai/manage/ability/update', { code: 200, data: {}, msg: '请求成功' }, false);

// 闭源 API（try-import）
let addAbility, removeAbility;
let findPluginSourceByPage, addPluginSource, updatePluginSource, removePluginSource, publishPluginSource;
let findLicenseByPage, addLicense, updateLicense, removeLicense, renewLicense;
try {
  const csApi = require('./closed-source/ai-closed-source.js');
  addAbility = csApi.addAbility;
  removeAbility = csApi.removeAbility;
  findPluginSourceByPage = csApi.findPluginSourceByPage;
  addPluginSource = csApi.addPluginSource;
  updatePluginSource = csApi.updatePluginSource;
  removePluginSource = csApi.removePluginSource;
  publishPluginSource = csApi.publishPluginSource;
  findLicenseByPage = csApi.findLicenseByPage;
  addLicense = csApi.addLicense;
  updateLicense = csApi.updateLicense;
  removeLicense = csApi.removeLicense;
  renewLicense = csApi.renewLicense;
} catch (e) {
  /* 开源版本 */
}

export {
  findProviderByList,
  findProviderByPage,
  addProvider,
  updateProvider,
  removeProvider,
  findAppByList,
  findAppByPage,
  addApp,
  updateApp,
  removeApp,
  findPresetByList,
  findPresetByPage,
  addPreset,
  updatePreset,
  removePreset,
  findKnowledgePackByList,
  findKnowledgePackByPage,
  addKnowledgePack,
  updateKnowledgePack,
  removeKnowledgePack,
  findUserAppList,
  findConversationByPage,
  createConversation,
  findMessageByConversation,
  removeConversation,
  findManageConversationByPage,
  findManageMessageByConversation,
  removeManageConversation,
  removeManyManageConversation,
  userChat,
  getAcceptTypes,
  activateLicense,
  getLicenseStatus,
  syncLicense,
  pluginStatus,
  findAbilityByList,
  findAbilityByPage,
  updateAbility,
  addAbility,
  removeAbility,
  findPluginSourceByPage,
  addPluginSource,
  updatePluginSource,
  removePluginSource,
  publishPluginSource,
  findLicenseByPage,
  addLicense,
  updateLicense,
  removeLicense,
  renewLicense,
};
