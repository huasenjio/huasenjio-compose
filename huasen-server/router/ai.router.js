const express = require('express');
const router = express.Router();
const {
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
  getAcceptTypes,
  findUserAppList,
  findUserKnowledgePackList,
  createConversation,
  findConversationByPage,
  findManageConversationByPage,
  removeConversation,
  removeManageConversation,
  removeManyManageConversation,
  removeMessages,
  findMessageByConversation,
  findManageMessageByConversation,
  uploadAttachment,
  userChat,
  userChatStream,
  pluginStatus,
  findAbilityByList,
  findAbilityByPage,
  updateAbility,
} = require('../controller/ai.controller.js');
const { handleJWT, handleUselessParams } = require('../middleware/common.middleware.js');
const { checkManagePower } = require('../middleware/power.middleware.js');

router.post('/manage/provider/list', handleJWT(), checkManagePower, findProviderByList);
router.post('/manage/provider/findByPage', handleJWT(), checkManagePower, findProviderByPage);
router.post('/manage/provider/add', handleJWT(), checkManagePower, handleUselessParams, addProvider);
router.post('/manage/provider/update', handleJWT(), checkManagePower, handleUselessParams, updateProvider);
router.post('/manage/provider/remove', handleJWT(), checkManagePower, removeProvider);

router.post('/manage/app/list', handleJWT(), checkManagePower, findAppByList);
router.post('/manage/app/findByPage', handleJWT(), checkManagePower, findAppByPage);
router.post('/manage/app/add', handleJWT(), checkManagePower, handleUselessParams, addApp);
router.post('/manage/app/update', handleJWT(), checkManagePower, handleUselessParams, updateApp);
router.post('/manage/app/remove', handleJWT(), checkManagePower, removeApp);

router.post('/manage/preset/list', handleJWT(), checkManagePower, findPresetByList);
router.post('/manage/preset/findByPage', handleJWT(), checkManagePower, findPresetByPage);
router.post('/manage/preset/add', handleJWT(), checkManagePower, handleUselessParams, addPreset);
router.post('/manage/preset/update', handleJWT(), checkManagePower, handleUselessParams, updatePreset);
router.post('/manage/preset/remove', handleJWT(), checkManagePower, removePreset);

router.post('/manage/knowledge-pack/list', handleJWT(), checkManagePower, findKnowledgePackByList);
router.post('/manage/knowledge-pack/findByPage', handleJWT(), checkManagePower, findKnowledgePackByPage);
router.post('/manage/knowledge-pack/add', handleJWT(), checkManagePower, handleUselessParams, addKnowledgePack);
router.post('/manage/knowledge-pack/update', handleJWT(), checkManagePower, handleUselessParams, updateKnowledgePack);
router.post('/manage/knowledge-pack/remove', handleJWT(), checkManagePower, removeKnowledgePack);

router.post('/manage/acceptTypes', handleJWT(), checkManagePower, getAcceptTypes);
router.post('/manage/conversation/findByPage', handleJWT(), checkManagePower, findManageConversationByPage);
router.post('/manage/conversation/remove', handleJWT(), checkManagePower, removeManageConversation);
router.post('/manage/conversation/removeMany', handleJWT(), checkManagePower, removeManyManageConversation);
router.post('/manage/message/findByConversation', handleJWT(), checkManagePower, findManageMessageByConversation);

router.post('/user/app/list', handleJWT(), findUserAppList);
router.post('/user/knowledge-pack/list', handleJWT(), findUserKnowledgePackList);
router.post('/user/conversation/create', handleJWT(), handleUselessParams, createConversation);
router.post('/user/conversation/findByPage', handleJWT(), findConversationByPage);
router.post('/user/conversation/remove', handleJWT(), removeConversation);
router.post('/user/message/remove', handleJWT(), handleUselessParams, removeMessages);
router.post('/user/message/findByConversation', handleJWT(), findMessageByConversation);
router.post('/user/attachment/upload', handleJWT(), uploadAttachment);
router.post('/user/chat', handleJWT(), handleUselessParams, userChat);
router.post('/user/chat/stream', handleJWT(), handleUselessParams, userChatStream);

// AI 插件
router.post('/plugin/status', handleJWT(false), pluginStatus);
router.post('/manage/ability/list', handleJWT(), checkManagePower, findAbilityByList);
router.post('/manage/ability/findByPage', handleJWT(), checkManagePower, findAbilityByPage);
router.post('/manage/ability/update', handleJWT(), checkManagePower, handleUselessParams, updateAbility);

// 闭源路由（try-catch 动态挂载）
try {
  const abilityManageRouter = require('./closed-source/ability-manage.router.js');
  router.use('/manage/ability', abilityManageRouter);
  const aiPluginManageRouter = require('./closed-source/ai-plugin-manage.router.js');
  router.use('/manage/plugin-source', aiPluginManageRouter);
} catch (e) {}

module.exports = router;
