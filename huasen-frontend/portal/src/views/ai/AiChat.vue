<template>
  <div class="ai-chat-container">
    <div class="ai-chat">
      <div class="chat-sidebar" :class="{ 'sidebar-mobile': isMobile, 'sidebar-show': showSidebar }">
        <div class="sidebar-header">
          <font class="mr-auto font-bold">会话列表</font>
          <el-button type="primary" size="mini" icon="el-icon-circle-plus-outline" @click="createConversation" plain> 新会话</el-button>
          <el-button v-if="isMobile" size="mini" icon="el-icon-close" @click="showSidebar = false" circle class="close-sidebar-btn"></el-button>
        </div>
        <div class="conversation-list" v-if="conversations.length > 0">
          <div v-for="conv in conversations" :key="conv._id" class="conversation-item" :class="{ active: currentConversationId === conv._id }" @click="switchConversation(conv)">
            <div class="conv-title">{{ conv.title }}</div>
            <div class="conv-meta">
              <span class="conv-meta__summary">{{ getConversationMeta(conv) }}</span>
              <i class="conv-meta__delete el-icon-delete" @click.stop="deleteConversation(conv._id)"></i>
            </div>
          </div>
        </div>
        <div class="conversation-empty" v-else>
          <el-empty description="暂无会话"></el-empty>
        </div>
        <div class="sidebar-footer">
          <el-pagination
            small
            layout="prev, pager, next"
            :total="conversationTotal"
            :page-size="pageSize"
            :current-page="pageNo"
            @current-change="handlePageChange"
          ></el-pagination>
        </div>
      </div>
      <div class="chat-main">
        <div class="chat-header">
          <el-button v-if="isMobile" icon="el-icon-s-unfold" circle size="small" @click="showSidebar = !showSidebar" class="toggle-sidebar-btn"></el-button>
          <div class="header-info" :class="{ 'header-info-full': isMobile && !needLogin }">
            <div class="app-select">
              <el-select v-model="currentAppId" @change="handleAppChange" placeholder="选择AI应用">
                <el-option v-for="app in apps" :key="app._id" :label="app.name" :value="app._id">
                  <span style="float: left; display: flex; align-items: center; gap: 6px">
                    <img v-if="getAppIconUrl(app.icon)" :src="getAppIconUrl(app.icon)" style="width: 18px; height: 18px; border-radius: 4px; object-fit: cover; flex-shrink: 0" />
                    <i v-else class="iconfont icon-aiapp" style="font-size: 16px; color: var(--ui-theme); flex-shrink: 0"></i>
                    <span>{{ app.name }}</span>
                  </span>
                </el-option>
              </el-select>
            </div>
          </div>
          <div class="header-actions">
            <el-button v-if="needLogin" type="primary" size="small" @click="showLogin"> 登 录 </el-button>
          </div>
        </div>
        <div class="message-container" ref="messageContainer">
          <div class="welcome-panel" v-if="messages.length === 0 && currentApp">
            <div class="welcome-icon">
              <img v-if="getAppIconUrl(currentApp.icon)" :src="getAppIconUrl(currentApp.icon)" class="welcome-app-icon" />
              <i v-else class="iconfont icon-aiapp"></i>
            </div>
            <h2 v-if="currentApp.welcomeText">{{ currentApp.welcomeText }}</h2>
          </div>
          <div v-for="(msg, index) in messages" :key="msg._id || index" class="message-item" :class="msg.role">
            <div class="message-avatar">
              <img v-if="msg.role === 'user' && user.headImg" class="w-full h-full" v-lazy="{ unload: require('@/assets/img/head/0.png') }" :src="user.headImg" />
              <i v-else-if="msg.role === 'user'" class="iconfont icon-md-happy" style="font-size: 24px"></i>
              <img v-else-if="getAppIconUrl(currentApp && currentApp.icon)" :src="getAppIconUrl(currentApp.icon)" class="w-full h-full" />
              <i v-else class="iconfont icon-aiapp" style="font-size: 24px"></i>
            </div>
            <div class="message-content">
              <div class="message-body">
                <div v-if="msg.attachments && msg.attachments.length > 0" class="attachments">
                  <div v-for="att in msg.attachments" :key="att._id" class="attachment-item" :class="att.kind" @click="previewAttachment(att)">
                    <i v-if="att.kind === 'image'" class="el-icon-picture-outline"></i>
                    <i v-else class="el-icon-document"></i>
                    <span class="att-name">{{ att.name }}</span>
                  </div>
                </div>
                <Markdown v-if="msg.content" :value="msg.content" :showFooter="false" :showAnchors="false" theme="github" :html="false" :looseCodeFence="msg.role === 'assistant'" class="message-markdown" />
                <!-- loading光标 -->
                <span v-if="msg.streaming" class="streaming-cursor"></span>
                <template v-else>
                  <div v-if="msg.status === 'failed'" class="expect-hint error-hint">
                    <i class="el-icon-warning"></i>
                    <span>{{ msg.errorMessage || '生成失败' }}</span>
                  </div>
                  <div v-else-if="msg.status === 'stopped'" class="expect-hint stopped-hint">
                    <!-- <i class="el-icon-video-pause"></i>
                    <span>{{ msg.errorMessage || '已手动停止' }}</span> -->
                  </div>
                </template>
              </div>
              <div class="message-meta">
                <div v-if="msg.role === 'assistant'" class="message-meta-item">
                  <span>{{ getMessageTimeText(msg) }}</span>
                  <span v-if="msg.model">{{ ' · ' + msg.model }}</span>
                  <span v-if="getMessageStatusLabel(msg)">
                    · <font class="message-status-text" :class="getMessageStatusClass(msg)">{{ getMessageStatusLabel(msg) }}</font>
                  </span>
                  <span v-if="getUsageSummary(msg)">
                    ·
                    {{ getUsageSummary(msg) }}
                  </span>
                </div>
                <div v-else class="message-meta-item">{{ getMessageMetaLine(msg) }}</div>
                <div class="message-meta-item message-meta__id">消息ID：{{ msg._id }}</div>
                <div class="message-actions">
                  <i class="el-icon-document-copy action-icon" title="拷贝内容" @click="copyMessageContent(msg)"></i>
                  <i v-if="showDeleteRoundIcon(msg)" class="el-icon-delete action-icon" title="删除本轮问答" @click="deleteRound(msg)"></i>
                  <i v-if="showRegenerateIcon(msg)" class="el-icon-refresh action-icon" title="重新回答" @click="regenerateAnswer(msg)"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="input-area">
          <div v-if="knowledgePacks.length > 0" class="input-toolbar">
            <el-tooltip :disabled="!knowledgeSelectDisabled" :content="knowledgeSelectDisabledReason" placement="top">
              <div class="knowledge-select">
                <el-select
                  v-model="selectedKnowledgePackIds"
                  :multiple-limit="3"
                  :disabled="knowledgeSelectDisabled"
                  multiple
                  filterable
                  clearable
                  collapse-tags
                  popper-class="knowledge-select-popper"
                  placeholder="选择知识包"
                  size="mini"
                >
                  <i slot="prefix" class="el-icon-collection knowledge-select__prefix"></i>
                  <el-option v-for="pack in knowledgePacks" :key="pack._id" :label="pack.name" :value="pack._id">
                    <div class="knowledge-option">
                      <div class="knowledge-option__name">{{ pack.name }}</div>
                      <div :title="pack.description" class="knowledge-option__desc">{{ pack.description || '--' }}</div>
                    </div>
                  </el-option>
                </el-select>
              </div>
            </el-tooltip>
          </div>
          <div class="input-row">
            <input ref="fileInput" type="file" multiple style="display: none" @change="handleFileSelect" :accept="fileAccept" />
            <div class="input-body">
              <div v-if="selectedFiles.length > 0" class="file-preview">
                <div v-for="(file, index) in selectedFiles" :key="index" class="preview-chip">
                  <img v-if="file.preview" v-lazy :src="file.preview" class="chip-img" />
                  <i v-else class="el-icon-document chip-icon"></i>
                  <span class="chip-name">{{ file.name }}</span>
                  <i class="el-icon-circle-close chip-remove" @click="removeFile(index)"></i>
                </div>
              </div>
              <textarea
                ref="textareaRef"
                v-model="inputMessage"
                class="input-textarea"
                placeholder="Ctrl + Enter 直接发送"
                :disabled="needLogin"
                @keydown.enter.ctrl.exact="() => sendMessage()"
                @input="autoResize"
                @focus="autoResize"
              ></textarea>
            </div>
            <div class="input-tool">
              <div class="input-tool-left">
                <el-tooltip v-if="currentApp && (currentApp.allowImage || currentApp.allowFile)" :content="`支持${fileAccept.split(',').join('、')}文件`" placement="top">
                  <el-button class="attach-btn" icon="el-icon-paperclip" :disabled="loading" @click.native="triggerFileSelect"></el-button>
                </el-tooltip>
              </div>
              <button v-if="streaming" class="send-btn" :disabled="!canStop" @click="abortStream">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12" rx="1"></rect>
                </svg>
              </button>
              <button v-else class="send-btn" :disabled="!canSend" @click="() => sendMessage()">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M3.69 19.56L21.38 12 3.69 4.44 3.69 10.5l12.75 2.25L3.69 15z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { tool } from 'huasen-lib';
import Markdown from '@/components/common/markdown/Markdown.vue';

export default {
  name: 'AiChat',
  components: { Markdown },
  data() {
    return {
      apps: [],
      currentAppId: '',
      knowledgePacks: [],
      selectedKnowledgePackIds: [],
      conversations: [],
      conversationTotal: 0,
      pageNo: 1,
      pageSize: 10,
      currentConversationId: '',
      currentConversationKnowledgePackIds: [],
      messages: [],
      inputMessage: '',
      selectedFiles: [],

      loading: false,
      streaming: false, // AI 是否正在流式输出
      showSidebar: true,
      isMobile: false,
      abortController: null,
      activeRequestId: '',
      activeAssistantMessageId: '',
      activeConversationId: '',
      autoScrollEnabled: true, // 智能滚动控制

      needLogin: false, // 是否需要登录

      defaultImageTypes: [],
      defaultFileTypes: [],
    };
  },
  computed: {
    ...mapState(['user']),
    ...mapGetters(['isLogin']),
    currentApp() {
      return this.apps.find(app => app._id === this.currentAppId) || null;
    },
    canUpload() {
      return !this.needLogin && this.currentApp && (this.currentApp.allowImage || this.currentApp.allowFile);
    },
    fileAccept() {
      if (!this.currentApp) return '';
      var parts = [];
      if (this.currentApp.allowImage) {
        var imageTypes = this.currentApp.acceptImageTypes;
        if (imageTypes && imageTypes.length > 0) {
          parts = parts.concat(imageTypes);
        } else {
          parts = parts.concat(this.defaultImageTypes);
        }
      }
      if (this.currentApp.allowFile) {
        var fileTypes = this.currentApp.acceptFileTypes;
        if (fileTypes && fileTypes.length > 0) {
          parts = parts.concat(fileTypes);
        } else {
          parts = parts.concat(this.defaultFileTypes);
        }
      }
      return parts.join(',');
    },
    canSend() {
      return !this.needLogin && this.currentApp && !this.loading && this.inputMessage.trim();
    },
    canStop() {
      return !this.needLogin && this.currentApp && this.streaming;
    },
    conversationHasKnowledgePacks() {
      return this.currentConversationKnowledgePackIds.length > 0;
    },
    canSelectKnowledgePacks() {
      return !this.streaming && !this.conversationHasKnowledgePacks;
    },
    knowledgeSelectDisabled() {
      return !this.canSelectKnowledgePacks;
    },
    knowledgeSelectDisabledReason() {
      if (this.streaming) return 'AI正在生成回复中';
      if (this.conversationHasKnowledgePacks) return '当前会话已绑定知识包';
      return '';
    },
    // 获取图片完整 URL（兼容相对路径和绝对 URL）
    getAppIconUrl() {
      return iconUrl => {
        if (!iconUrl) return '';
        return tool.getFullURL(iconUrl);
      };
    },
  },
  watch: {
    isLogin: {
      handler(val) {
        this.needLogin = !val;
      },
      immediate: true,
    },
  },

  mounted() {
    this.checkMobile();

    window.addEventListener('resize', this.checkMobile);
    this.setupScrollListener();
  },
  created() {
    this.loadAcceptTypes();
  },
  activated() {
    this.commitAll({ showWrapSidebar: false });
    this.loadApps();
  },
  deactivated() {
    this.commitAll({ showWrapSidebar: true });
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.checkMobile);
    this.abortStream();
  },
  methods: {
    ...mapMutations(['commitAll']),
    /**
     * 加载后端支持的文件类型
     */
    loadAcceptTypes() {
      this.API.AI.getAcceptTypes({}, { notify: false })
        .then(res => {
          var acceptTypes = res.data || {};
          var imageTypes = [];
          var fileTypes = [];
          Object.keys(acceptTypes).forEach(function (ext) {
            var mime = acceptTypes[ext] || '';
            if (mime.indexOf('image/') === 0) {
              imageTypes.push(ext);
            } else {
              fileTypes.push(ext);
            }
          });
          this.defaultImageTypes = imageTypes;
          this.defaultFileTypes = fileTypes;
        })
        .catch(() => {
          // 接口失败时使用空数组，避免阻塞页面
          this.defaultImageTypes = [];
          this.defaultFileTypes = [];
        });
    },
    /**
     * 是否显示重新回答图标
     * @param msg 消息对象
     */
    showRegenerateIcon(msg) {
      return msg.role === 'assistant' && !msg.streaming && msg.status !== 'pending' && !this.streaming;
    },

    /**
     * 是否显示删除本轮问答图标
     * @param msg 消息对象
     */
    showDeleteRoundIcon(msg) {
      if (msg.role !== 'user' || this.streaming) return false;
      const round = this.getRoundPair(msg);
      return Boolean(round && !round.assistantMsg.streaming && round.assistantMsg.status !== 'pending');
    },

    /**
     * 获取当前消息所属的轮问答对
     * @param msg 消息对象
     * @returns {Object|null} 轮问答对对象或 null
     */
    getRoundPair(msg) {
      const msgIndex = this.messages.findIndex(item => item._id === msg._id);
      if (msgIndex < 0) return null;
      const userMsgIndex = msg.role === 'assistant' ? msgIndex - 1 : msgIndex;
      const assistantMsgIndex = msg.role === 'user' ? msgIndex + 1 : msgIndex;
      const userMsg = userMsgIndex >= 0 ? this.messages[userMsgIndex] : null;
      const assistantMsg = assistantMsgIndex >= 0 ? this.messages[assistantMsgIndex] : null;
      if (!userMsg || !assistantMsg) return null;
      if (userMsg.role !== 'user' || assistantMsg.role !== 'assistant') return null;
      return {
        userMsgIndex,
        assistantMsgIndex,
        userMsg,
        assistantMsg,
      };
    },

    /**
     * 删除当前轮所属的轮问答对
     * @param round 轮问答对对象
     */
    async removeRoundPair(round) {
      const isTempUser = String(round.userMsg._id).startsWith('temp-');
      const isTempAssistant = String(round.assistantMsg._id).startsWith('temp-');
      if (!isTempUser && !isTempAssistant) {
        await this.API.AI.removeMessages({ userMessageId: round.userMsg._id, assistantMessageId: round.assistantMsg._id }, { notify: false });
      }
      this.messages.splice(round.userMsgIndex, 2);
      if (!isTempUser && !isTempAssistant) {
        await this.loadConversations();
      }
    },

    /**
     * 删除当前轮所属的轮问答对
     * @param msg 消息对象
     */
    async deleteRound(msg) {
      const round = this.getRoundPair(msg);
      if (!round) {
        this.$tips('error', '消息配对异常，无法删除该轮问答', 'top-right', 2000);
        return;
      }
      try {
        await this.$confirm('确定删除这一轮问答吗？', '提示', { type: 'warning' });
        await this.removeRoundPair(round);
        this.$tips('success', '删除成功', 'top-right', 1200);
      } catch (err) {
        if (err !== 'cancel') {
          this.$tips('error', err.message || '删除失败', 'top-right', 2000);
        }
      }
    },

    /**
     * 停止当前流式输出
     */
    resetActiveStreamState() {
      this.activeRequestId = '';
      this.activeAssistantMessageId = '';
      this.activeConversationId = '';
    },

    /**
     * 标记已停止流式输出
     * @param messageId 消息 ID 或 null 表示所有流式输出
     * @param errorMessage 错误消息或 null 表示无错误
     */
    markAssistantStopped(messageId, errorMessage = '已手动停止') {
      const assistantIndex = this.messages.findIndex(m => m._id === messageId || (!messageId && m.streaming));
      if (assistantIndex < 0) return;
      this.$set(this.messages, assistantIndex, {
        ...this.messages[assistantIndex],
        streaming: false,
        status: 'stopped',
        errorMessage,
      });
    },
    checkMobile() {
      this.isMobile = window.innerWidth <= 768;
    },

    /**
     * 显示登录弹窗
     */
    showLogin() {
      this.needLogin = true;
      this.apps = [];
      this.conversations = [];
      this.messages = [];
      this.commitAll({ showWrapSign: true });
    },

    closeLogin() {
      this.needLogin = false;
      this.commitAll({ showWrapSign: false });
    },

    /**
     * 加载启用的AI应用列表
     */
    async loadApps() {
      try {
        const res = await this.API.AI.findEnabledApps({}, { loading: false, notify: false });
        if (Array.isArray(res.data)) {
          this.apps = res.data;
          if (this.apps.length > 0 && !this.currentAppId) {
            // 优先从 URL 参数读取 appId
            const urlAppId = this.$route.query.appId;
            const targetApp = urlAppId && this.apps.find(app => app._id === urlAppId);
            this.currentAppId = targetApp ? targetApp._id : this.apps[0]._id;
            // 更新 URL 参数
            this.updateUrlParams({ appId: this.currentAppId });
            await this.loadConversations();
            // 页面刷新时，如果有会话，默认选择第一个
            if (this.conversations.length > 0) {
              this.switchConversation(this.conversations[0]);
            }
            await this.loadKnowledgePacks();
          }
        }
        // 关闭弹出
        this.closeLogin();
      } catch (err) {
        // 处理登录过期或未登录的情况
        if (err && err.request && (err.request.status === 403 || err.request.status === 401)) {
          this.showLogin();
        }
      }
    },

    /**
     * 加载当前应用下的会话列表
     */
    async loadConversations() {
      if (!this.currentAppId) return;
      try {
        const res = await this.API.AI.findConversationByPage({ appId: this.currentAppId, pageNo: this.pageNo, pageSize: this.pageSize }, { loading: false, notify: false });
        if (res) {
          this.conversations = res.data.list || [];
          this.conversationTotal = res.data.total || 0;
        }
      } catch (err) {
        console.error('加载会话列表失败', err);
      }
    },
    async loadKnowledgePacks() {
      if (!this.currentAppId) {
        this.knowledgePacks = [];
        this.selectedKnowledgePackIds = [];
        return;
      }
      try {
        const res = await this.API.AI.findKnowledgePackList({ appId: this.currentAppId }, { loading: false, notify: false });
        this.knowledgePacks = Array.isArray(res.data) ? res.data : [];
        const validIds = this.knowledgePacks.map(item => item._id);
        this.selectedKnowledgePackIds = this.selectedKnowledgePackIds.filter(id => validIds.includes(id));
      } catch (err) {
        this.knowledgePacks = [];
        this.selectedKnowledgePackIds = [];
      }
    },
    async loadMessages(conversationId) {
      if (!conversationId) {
        this.messages = [];
        return;
      }
      try {
        const res = await this.API.AI.findMessageByConversation({ conversationId }, { loading: false, notify: false });
        this.messages = res.data.map(msg => ({ ...msg, streaming: false }));
        this.$nextTick(() => this.scrollToBottom());
      } catch (err) {
        console.error('加载消息失败', err);
      }
    },
    async handleAppChange() {
      this.currentConversationId = '';
      this.currentConversationKnowledgePackIds = [];
      this.messages = [];
      this.selectedKnowledgePackIds = [];
      this.pageNo = 1;
      // 更新 URL 参数
      this.updateUrlParams({ appId: this.currentAppId });
      await this.loadKnowledgePacks();
      await this.loadConversations();
      // 切换应用时，如果有会话，默认选择第一个
      if (this.conversations.length > 0) {
        this.switchConversation(this.conversations[0]);
      }
    },
    async createConversation() {
      this.abortStream();
      this.resetActiveStreamState();

      this.currentConversationId = '';
      this.currentConversationKnowledgePackIds = [];
      this.messages = [];
      this.inputMessage = '';
      this.selectedFiles = [];
      this.selectedKnowledgePackIds = [];
    },
    switchConversation(conv) {
      if (this.currentConversationId === conv._id) return;
      this.abortStream();
      this.currentConversationId = conv._id;
      this.currentConversationKnowledgePackIds = Array.isArray(conv.knowledgePackIds) ? [].concat(conv.knowledgePackIds) : [];
      this.selectedKnowledgePackIds = [].concat(this.currentConversationKnowledgePackIds);
      this.loadMessages(conv._id);
      // 移动端切换会话后自动关闭侧边栏
      if (this.isMobile) {
        this.showSidebar = false;
      }
    },
    async deleteConversation(conversationId) {
      try {
        await this.$confirm('确定删除该会话吗？', '提示', { type: 'warning' });
        const res = await this.API.AI.removeConversation({ _id: conversationId }, { notify: false });
        if (res) {
          this.$tips('success', '删除成功', 'top-right');
          const isDeleteCurrent = this.currentConversationId === conversationId;
          await this.loadConversations();
          // 删除的是当前会话，且还有会话，默认选择第一个
          if (isDeleteCurrent) {
            if (this.conversations.length > 0) {
              this.switchConversation(this.conversations[0]);
            } else {
              this.currentConversationId = '';
              this.currentConversationKnowledgePackIds = [];
              this.messages = [];
            }
          }
        }
      } catch (err) {
        if (err !== 'cancel') {
          console.error('删除会话失败', err);
        }
      }
    },
    handlePageChange(page) {
      this.pageNo = page;
      this.loadConversations();
    },
    triggerFileSelect() {
      if (!this.canUpload) return;
      this.$refs.fileInput.click();
    },
    handleFileSelect(e) {
      const files = Array.from(e.target.files || []);
      const canUseImage = this.currentApp && this.currentApp.allowImage;
      const canUseFile = this.currentApp && this.currentApp.allowFile;
      files.forEach(file => {
        const isImage = /^image\//.test(file.type);
        if ((isImage && !canUseImage) || (!isImage && !canUseFile)) {
          return;
        }
        if (isImage) {
          const reader = new FileReader();
          reader.onload = ev => {
            this.selectedFiles.push({ file, name: file.name, preview: ev.target.result });
          };
          reader.readAsDataURL(file);
        } else {
          this.selectedFiles.push({ file, name: file.name, preview: null });
        }
      });
      e.target.value = '';
    },
    removeFile(index) {
      this.selectedFiles.splice(index, 1);
    },
    autoResize() {
      this.$nextTick(() => {
        const el = this.$refs.textareaRef;
        if (!el) return;
        el.style.height = 'auto';
        const naturalHeight = el.scrollHeight;
        const maxHeight = 120;
        el.style.height = Math.min(naturalHeight, maxHeight) + 'px';
        el.style.overflowY = naturalHeight > maxHeight ? 'auto' : 'hidden';
      });
    },

    /**
     * 发起对话
     * @param {boolean} isRegenerate - 是否为重新生成
     * @param {string[]} regenAttachmentIds - 重新生成时已有的附件 ID 列表
     * @param {Object[]} regenAttachments - 重新生成时已有的附件详情列表
     */
    async sendMessage(isRegenerate = false, regenAttachmentIds = [], regenAttachments = []) {
      if (!this.canSend) return;
      this.abortStream();
      // 发送消息时强制启用自动滚动
      this.autoScrollEnabled = true;
      const content = this.inputMessage.trim();
      const files = [...this.selectedFiles];
      const requestKnowledgePackIds = this.canSelectKnowledgePacks ? this.selectedKnowledgePackIds : [];
      this.loading = true;
      let attachmentIds = [];

      if (isRegenerate && regenAttachmentIds.length > 0) {
        // 重新生成：从已有附件直接复用，不需要上传
        attachmentIds = regenAttachmentIds;
      } else if (!isRegenerate && files.length > 0) {
        // 首次发送：需要上传附件
        try {
          const formData = new FormData();
          files.forEach(item => formData.append('file', item.file));
          const uploadedResult = await this.API.AI.uploadAttachment(formData, { loading: false, notify: false });
          if (uploadedResult && Array.isArray(uploadedResult.data)) {
            attachmentIds = uploadedResult.data.map((att, index) => {
              files[index].attachmentId = att._id;
              return att._id;
            });
          }
        } catch (err) {
          this.loading = false;
          this.$tips('error', '附件上传失败', 'top-right', 2000);
          return;
        }
      } else {
        attachmentIds = files.map(f => f.attachmentId);
      }

      // 构建用户消息的附件展示数据
      const buildUserAttachments = () => {
        if (regenAttachments.length > 0) {
          // 重新生成：使用已有的附件详情
          return regenAttachments.map(att => ({ name: att.name, kind: att.kind, url: att.url || att.path }));
        }
        // 首次发送：使用本地文件预览
        return files.map(f => ({ name: f.name, kind: /^image\//.test(f.file.type) ? 'image' : 'file', url: f.preview }));
      };

      const tempUserId = `temp-user-${Date.now()}`;
      const tempAssistantId = `temp-assistant-${Date.now()}`;
      const tempUserMsg = {
        _id: tempUserId,
        role: 'user',
        content,
        contentType: 'text',
        attachments: buildUserAttachments(),
        creatTime: new Date(),
        status: 'success',
        streaming: false,
      };
      const tempAssistantMsg = {
        _id: tempAssistantId,
        role: 'assistant',
        content: '',
        contentType: 'text',
        attachments: [],
        creatTime: new Date(),
        status: 'pending',
        streaming: true,

        // 记录提问内容及附件，用于重新回答
        _regenContent: content,
        _regenFiles: files,
      };
      // 界面显示临时消息，等待服务器响应，并且滚动到最底部
      this.messages.push(tempUserMsg, tempAssistantMsg);
      this.inputMessage = '';
      this.selectedFiles = [];
      this.$nextTick(() => this.scrollToBottom());

      this.abortController = new AbortController();
      const token = this.user.token || '';
      let accumulatedContent = '';
      let realRequestId = '';
      let realConversationId = this.currentConversationId;
      let realUserMessageId = tempUserId;
      let realAssistantMessageId = tempAssistantId;
      let sawError = false;
      let sawStopped = false;
      this.streaming = true;
      let userMessageIndex = -1;
      let assistantMessageIndex = -1;
      try {
        await fetchEventSource(this.API.AI.chatStreamUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Token: token,
            Dot: 'user',
          },
          body: JSON.stringify({
            appId: this.currentAppId,
            conversationId: this.currentConversationId,
            content,
            attachmentIds,
            knowledgePackIds: requestKnowledgePackIds,
          }),
          signal: this.abortController.signal,
          openWhenHidden: true,
          onopen: async response => {
            // 优先使用缓存的索引，未缓存时查找并缓存
            userMessageIndex = this.messages.findIndex(m => m._id === tempUserId);
            assistantMessageIndex = this.messages.findIndex(m => m._id === tempAssistantId);
            if (response.ok) return;
            if (response.status >= 400 && response.status < 500 && response.status !== 429) {
              throw new Error(`请求失败: ${response.status}`);
            }
          },
          onmessage: event => {
            if (event.event === 'ping') return;
            let payload = {};
            try {
              payload = JSON.parse(event.data || '{}');
            } catch (err) {
              return;
            }
            if (event.event === 'ack') {
              realRequestId = payload.requestId;
              realConversationId = payload.conversationId;
              this.activeRequestId = realRequestId;
              this.activeConversationId = realConversationId;
              this.currentConversationId = realConversationId;
              return;
            }
            if (event.event === 'conversation') {
              if (payload.conversation) {
                const conversationKnowledgePackIds = Array.isArray(payload.conversation.knowledgePackIds) ? [].concat(payload.conversation.knowledgePackIds) : [];
                this.currentConversationKnowledgePackIds = conversationKnowledgePackIds;
                this.selectedKnowledgePackIds = [].concat(conversationKnowledgePackIds);
              }
              if (payload.userMessage) {
                realUserMessageId = payload.userMessage._id;
                this.$set(this.messages, userMessageIndex, {
                  ...this.messages[userMessageIndex],
                  _id: realUserMessageId,
                  contentType: payload.userMessage.contentType || this.messages[userMessageIndex].contentType,
                  attachments: payload.userMessage.attachments || [],
                });
              }
              if (payload.assistantMessage) {
                realAssistantMessageId = payload.assistantMessage._id;
                this.$set(this.messages, assistantMessageIndex, {
                  ...this.messages[assistantMessageIndex],
                  _id: realAssistantMessageId,
                  contentType: payload.assistantMessage.contentType || this.messages[assistantMessageIndex].contentType,
                });
              }
            }
            if (event.event === 'delta') {
              const delta = payload.delta || '';
              accumulatedContent += delta;
              // delta 事件高频触发，直接使用缓存的索引
              this.$set(this.messages, assistantMessageIndex, { ...this.messages[assistantMessageIndex], content: accumulatedContent, streaming: true });
              this.$nextTick(() => this.scrollToBottom());
            }
            if (event.event === 'done') {
              if (sawStopped || sawError) return;
              this.$set(this.messages, assistantMessageIndex, {
                ...this.messages[assistantMessageIndex],
                content: accumulatedContent,
                status: 'success',
                streaming: false,
                model: payload.model,
                usage: payload.usage,
                finishReason: payload.finishReason,
              });
              this.loadConversations();
            }
            if (event.event === 'error') {
              const stoppedByUser = payload.code === 'USER_STOPPED';
              sawError = !stoppedByUser;
              sawStopped = stoppedByUser;
              this.$set(this.messages, assistantMessageIndex, {
                ...this.messages[assistantMessageIndex],
                content: accumulatedContent,
                status: stoppedByUser ? 'stopped' : 'failed',
                errorMessage: payload.message || (stoppedByUser ? '已手动停止' : 'AI对话异常'),
                streaming: false,
              });
            }
          },
          onerror: err => {
            throw err;
          },
        });
      } catch (err) {
        if (err.name === 'AbortError' || sawStopped) {
          // 手动停止或被取消
          this.markAssistantStopped(realAssistantMessageId, '已手动停止');
        } else if (sawError) {
          // error 事件处理
        } else {
          this.$set(this.messages, assistantMessageIndex, {
            ...this.messages[assistantMessageIndex],
            content: accumulatedContent,
            status: 'failed',
            errorMessage: err.message || 'AI对话异常',
            streaming: false,
          });
          this.$tips('error', err.message || 'AI对话异常', 'top-right', 2000);
        }
      } finally {
        this.loading = false;
        this.streaming = false;
        this.abortController = null;
        this.resetActiveStreamState();
      }
    },

    /**
     * 手动停止当前对话流
     */
    async abortStream() {
      const controller = this.abortController;
      const activeAssistantMessageId = this.activeAssistantMessageId;
      if (!controller) return;
      controller.abort();
      this.markAssistantStopped(activeAssistantMessageId);
      this.streaming = false;
      this.resetActiveStreamState();
    },

    copyMessageContent(msg) {
      const text = msg.content || '';
      if (!text) return;
      tool.copyTextToClip(
        text,
        () => {
          this.$tips('success', '已拷贝到剪贴板', 'top-right', 1200);
        },
        true,
      );
    },

    /**
     * 重新生成助手消息
     * @param msg 助手消息对象
     */
    async regenerateAnswer(msg) {
      const round = this.getRoundPair(msg);
      if (!round) {
        this.$tips('error', '消息配对异常，无法重新回答', 'top-right', 2000);
        return;
      }

      // 内容来源：优先用助手消息本地缓存（新消息），否则直接取数组中对应的用户消息（历史消息）
      const sourceContent = msg._regenContent || round.userMsg.content;
      // 附件来源：优先复用本地缓存的文件对象（新消息），否则从历史消息附件提取
      const files = msg._regenFiles ? [...msg._regenFiles] : [];
      // 历史消息的附件已包含完整的附件对象（loadMessages 时已从数据库加载）
      const userAttachments = Array.isArray(round.userMsg.attachments) ? round.userMsg.attachments : [];
      const attachmentIds = userAttachments.map(att => att._id).filter(Boolean);

      try {
        await this.removeRoundPair(round);
        // 回填用户消息内容和附件
        this.inputMessage = sourceContent;
        this.selectedFiles = files;
        // 重新生成时直接传入已有的附件 ID 和详情，不再上传
        this.sendMessage(true, attachmentIds, userAttachments);
      } catch (err) {
        this.$tips('error', err.message || '重新回答失败', 'top-right', 2000);
      }
    },
    previewAttachment(att) {
      if (att.kind === 'image' && att.url) {
        window.open(att.url, '_blank');
      }
    },
    getConversationMeta(conv) {
      const parts = [];
      const count = Number(conv.messageCount) || 0;
      if (count > 0) {
        parts.push(`${count}条消息`);
      }
      const timeText = this.formatTime(conv.lastMessageAt || conv.updateTime || conv.creatTime);
      if (timeText) {
        parts.push(timeText);
      }
      return parts.join(' · ');
    },
    getMessageStatusLabel(msg) {
      if (msg.streaming || msg.status === 'pending') return '生成中';
      if (msg.status === 'stopped') return '已手动停止';
      if (msg.status === 'failed') {
        return '失败';
      }
      if (msg.role === 'assistant') return '已完成';
      return '';
    },
    getMessageStatusClass(msg) {
      if (msg.streaming || msg.status === 'pending') return 'is-pending';
      if (msg.status === 'stopped') return 'is-stopped';
      if (msg.status === 'failed') {
        return 'is-failed';
      }
      return 'is-success';
    },
    getMessageTimeText(msg) {
      const prefix = msg.role === 'user' ? '发送于' : '响应于';
      const timeText = this.formatExactTime(msg.creatTime);
      return timeText ? `${prefix} ${timeText}` : '';
    },
    getMessageMetaLine(msg) {
      const parts = [];
      const timeText = this.getMessageTimeText(msg);
      if (timeText) {
        parts.push(timeText);
      }
      const attachmentText = this.getAttachmentSummary(msg);
      if (attachmentText) {
        parts.push(attachmentText);
      }
      return parts.join(' · ');
    },
    getAttachmentSummary(msg) {
      const attachments = Array.isArray(msg.attachments) ? msg.attachments : [];
      if (!attachments.length) return '';
      const imageCount = attachments.filter(item => item.kind === 'image').length;
      const fileCount = attachments.length - imageCount;
      const parts = [];
      if (imageCount > 0) {
        parts.push(`图片${imageCount}个`);
      }
      if (fileCount > 0) {
        parts.push(`文件${fileCount}个`);
      }
      return parts.join(' · ') || `${attachments.length}个附件`;
    },
    getUsageSummary(msg) {
      const usage = this.parseUsage(msg.usage);
      const total = usage.total_tokens || usage.totalTokens || 0;
      if (total) {
        return `总计 ${total} tokens`;
      }
      const prompt = usage.prompt_tokens || usage.input_tokens || usage.promptTokens || usage.inputTokens || 0;
      const completion = usage.completion_tokens || usage.output_tokens || usage.completionTokens || usage.outputTokens || 0;
      if (prompt || completion) {
        return `输入 ${prompt || 0} · 输出 ${completion || 0}`;
      }
      return '';
    },
    parseUsage(value) {
      if (Object.prototype.toString.call(value) === '[object Object]') {
        return value;
      } else {
        return {};
      }
    },
    formatExactTime(time) {
      if (!time) return '';
      const date = new Date(time);
      if (Number.isNaN(date.getTime())) return '';
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hour = String(date.getHours()).padStart(2, '0');
      const minute = String(date.getMinutes()).padStart(2, '0');
      return `${month}-${day} ${hour}:${minute}`;
    },
    scrollToBottom() {
      if (!this.autoScrollEnabled) return;
      const container = this.$refs.messageContainer;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    },
    setupScrollListener() {
      const container = this.$refs.messageContainer;
      if (!container) return;
      container.addEventListener('scroll', this.handleScroll);
    },
    handleScroll() {
      const container = this.$refs.messageContainer;
      if (!container) return;

      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;

      if (isAtBottom) {
        // 滚动到底部，立即启用自动滚动
        this.autoScrollEnabled = true;
      } else {
        // 向上滚动，立即禁用自动滚动
        this.autoScrollEnabled = false;
      }
    },
    formatTime(time) {
      if (!time) return '';
      const date = new Date(time);
      const now = new Date();
      const diff = now - date;
      if (diff < 60000) return '刚刚';
      if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${month}-${day} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    },
    /**
     * 更新 URL 参数
     */
    updateUrlParams(params) {
      const query = { ...this.$route.query, ...params };
      if (JSON.stringify(query) !== JSON.stringify(this.$route.query)) {
        this.$router.replace({ query }).catch(() => {});
      }
    },
  },
};
</script>

<style lang="scss">
.knowledge-select-popper {
  width: 186px !important;
  min-width: 186px !important;

  .el-select-dropdown__item {
    position: relative;
    height: auto;
    min-height: 52px;
    line-height: 1.4;
    padding: 8px 32px 8px 12px;
  }

  .el-select-dropdown__item.selected::after {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    margin-top: 0;
  }

  .knowledge-option {
    max-width: 200px;
  }

  .knowledge-option__name {
    font-size: 14px;
    line-height: 18px;
    color: var(--gray-900);
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .knowledge-option__desc {
    margin-top: 2px;
    font-size: 12px;
    line-height: 16px;
    color: var(--gray-500);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

@media (max-width: 768px) {
  .knowledge-select-popper {
    width: 150px !important;
    min-width: 150px !important;

    .knowledge-option {
      max-width: 150px;
    }
  }
}
</style>

<style lang="scss" scoped>
.ai-chat-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-y: auto;
  box-sizing: border-box;
  position: relative;
}
.ai-chat {
  width: calc(100% - 20px);
  height: calc(100% - 20px);
  display: flex;
  border-radius: 4px;
  background-color: var(--gray-0);
  outline: 1px solid var(--gray-200);
}
.chat-sidebar {
  width: 280px;
  background: var(--white);
  border-right: 1px solid var(--gray-200);
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
}
.sidebar-header {
  width: 100%;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  height: 58px;
  padding: 16px;
  .app-select {
    width: calc(100% - 42px);
    margin-right: 10px;
  }
  .close-sidebar-btn {
    margin-left: 8px;
    flex-shrink: 0;
  }
}
.conversation-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 16px;
}
.conversation-item {
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    outline: 1px solid var(--ui-theme);
  }
  &.active {
    outline: 1px solid var(--ui-theme);
  }
  .conv-title {
    width: calc(100% - 18px);
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .conv-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: var(--gray-500);
    gap: 8px;
    .conv-meta__summary {
      flex: 1;
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .conv-meta__delete {
      cursor: pointer;
      font-size: 14px;
      &:hover {
        color: var(--danger);
      }
    }
  }
}
.conversation-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.sidebar-footer {
  display: flex;
  justify-content: center;
  padding: 12px;
}
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.chat-header {
  padding: 16px;
  height: 58px;
  background: var(--white);
  display: flex;
  align-items: center;
  gap: 12px;
  .header-info {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 10px;
    overflow: hidden;
    h3 {
      margin: 0 0 4px 0;
      font-size: 18px;
    }
    p {
      margin: 0;
      font-size: 13px;
      color: var(--gray-500);
    }
    &.header-info-full {
      display: flex;
      justify-content: flex-end;
      margin-right: -12px;
    }
  }
  .app-select {
    width: 240px;
    flex-shrink: 0;
  }
  .toggle-sidebar-btn {
    flex-shrink: 0;
  }
  .header-actions {
    flex-shrink: 0;
  }
}
.message-container {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background-color: var(--gray-50);
}
.welcome-panel {
  text-align: center;
  padding: 60px 20px;
  .welcome-icon {
    color: var(--ui-theme);
    margin-bottom: 16px;
    img {
      width: 64px;
      height: 64px;
      border-radius: 12px;
      object-fit: cover;
    }
    i {
      font-size: 64px;
    }
  }
  h2 {
    margin: 0 0 12px 0;
    font-size: 24px;
  }
}
.message-item {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  &.user {
    flex-direction: row-reverse;
    .message-content {
      outline: 1px solid var(--ui-theme);
      border-top-right-radius: 0;
      .message-meta {
        padding-top: 12px;
        text-align: left;
      }
    }
  }

  &.assistant {
    .message-content {
      border-top-left-radius: 0 !important;
    }
  }

  .message-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;

    img {
      border-radius: 50%;
      object-fit: cover;
    }

    > i {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--gray-200);
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  .message-content {
    position: relative;
    max-width: 70%;
    background: var(--white);
    border-radius: 12px;
    padding: 12px 16px 12px 16px;
    box-shadow: 0 1px 2px var(--gray-o1);
    .message-meta {
      border-top: 1px solid var(--gray-200);
      color: var(--gray-500);
      padding-top: 12px;
      margin-top: 12px;
      font-size: 12px;
      .message-meta-item {
        margin-bottom: 8px;
        line-height: 1.6;
      }
      .message-status-text {
        font-weight: 500;
        &.is-pending {
          color: var(--ui-theme);
        }
        &.is-success {
          color: var(--success);
        }
        &.is-failed {
          color: var(--danger);
        }
        &.is-stopped {
          color: var(--warning);
        }
      }
      .message-meta__id {
        font-size: 12px;
        color: var(--gray-400);
      }
    }
  }

  .message-body {
    .attachments {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 8px;
    }
    .attachment-item {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      background: var(--gray-100);
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
      &:hover {
        background: var(--gray-200);
      }
      &.file {
        color: var(--primary);
      }
      &.image {
        color: var(--success);
      }
      .att-name {
        max-width: 120px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    .message-markdown {
      font-size: 14px;
      line-height: 1.6;
      word-break: break-word;
    }
    .expect-hint {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      font-size: 14px;
      margin-top: 8px;
      &.error-hint {
        color: var(--danger);
      }
      &.stopped-hint {
      }
    }
  }

  .message-actions {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 8px;
    transition: opacity 0.2s;
    .action-icon {
      font-size: 14px;
      color: var(--gray-400);
      cursor: pointer;
      padding: 2px 4px;
      border-radius: 4px;
      &:hover {
        color: var(--ui-theme);
        background: var(--gray-100);
      }
    }
  }
}

.streaming-cursor {
  display: inline-block;
  width: 2px;
  height: 1.2em;
  background: var(--ui-theme);
  border-radius: 2px;
  margin-left: 2px;
  vertical-align: text-bottom;
  animation: cursor-blink 1s ease-in-out infinite;
}

@keyframes cursor-blink {
  0% {
    opacity: 1;
  }
  25% {
    opacity: 0.2;
  }
  50% {
    opacity: 0.5;
  }
  75% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
  }
}

.input-area {
  background: var(--gray-50);
  padding: 8px 24px 20px;
  .input-toolbar {
    min-height: 34px;
    display: flex;
    align-items: center;
    padding: 0 0 8px;
  }
  .input-row {
    display: flex;
    justify-content: flex-end;
    flex-direction: column;
    background: var(--white);
    border-radius: 18px;
    border: 1px solid var(--gray-200);
    padding: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    transition: border-color 0.2s, box-shadow 0.2s;
    &:focus-within {
      border-color: var(--ui-theme);
      box-shadow: 0 2px 16px rgba(0, 0, 0, 0.1);
    }
  }
  .input-tool {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }
  .input-tool-left {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .knowledge-select {
    width: 186px;
    min-width: 0;
    height: 28px;
    position: relative;
    display: block;
    padding: 0;
    flex-shrink: 1;
    ::v-deep .el-select {
      width: 100%;
      & > .el-input {
        .el-input__prefix {
          width: 24px;
          line-height: 24px;
          pointer-events: none;
        }
        .el-input__inner {
          height: 26px;
          line-height: 26px;
          font-size: 12px;
          border-radius: 24px;
        }
      }
      & > .el-select__tags {
        flex-wrap: nowrap;
        padding-left: 30px;
        & > span {
          width: 100%;
          display: flex;
          align-items: center;
          overflow: hidden;
          .el-tag {
            min-width: 44px;
            max-width: 100%;
            flex: 0 1 auto;
            position: relative;
            display: inline-flex;
            align-items: center;
            height: 20px;
            margin: 2px 0 2px 2px;
            border-radius: 10px;
            overflow: hidden;
            &:not(:first-child) {
              flex: 0 0 auto;
            }
            .el-select__tags-text {
              min-width: 0;
              max-width: 100%;
              display: block;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              word-break: break-all;
            }
            .el-tag__close {
              flex-shrink: 0;
              position: relative;
              right: -5px;
              top: 1px;
            }
          }
        }
        .el-select__input {
          margin-left: 0;
        }
      }
    }
  }
  .attach-btn {
    flex-shrink: 0;
    color: var(--gray-500);
    border: none;
    background: transparent;
    font-size: 20px;
    padding: 4px;
    margin-bottom: 2px;
    &:hover {
      color: var(--ui-theme);
    }
  }

  .input-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .file-preview {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding: 4px 4px 0;
  }
  .preview-chip {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px 4px 6px;
    background: var(--gray-100);
    border-radius: 20px;
    font-size: 12px;
    color: var(--gray-600);
    max-width: 160px;
    border: 1px solid var(--gray-200);
    .chip-img {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
    }
    .chip-icon {
      font-size: 14px;
      flex-shrink: 0;
    }
    .chip-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
      min-width: 0;
    }
    .chip-remove {
      font-size: 12px;
      flex-shrink: 0;
      cursor: pointer;
      color: var(--gray-400);
      &:hover {
        color: var(--danger);
      }
    }
  }
  .input-textarea {
    width: 100%;
    border: none;
    outline: none;
    resize: none;
    background: transparent;
    font-family: inherit;
    font-size: 14px;
    line-height: 20px;
    color: var(--gray-900);
    padding: 2px 4px 2px;
    min-height: 20px;
    max-height: 120px;
    overflow-y: hidden;
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
    &::placeholder {
      color: var(--gray-400);
    }
    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }
  .send-btn {
    flex-shrink: 0;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    border: none;
    background: var(--ui-theme);
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s, transform 0.15s, opacity 0.2s;
    padding: 0;
    margin-bottom: 2px;
    margin-left: auto;
    &:hover:not(:disabled) {
      transform: scale(1.08);
    }
    &:active:not(:disabled) {
      transform: scale(0.95);
    }
    &:disabled {
      background: var(--gray-300);
      cursor: not-allowed;
      opacity: 0.6;
    }
  }
}

@media (max-width: 768px) {
  .ai-chat-container {
    padding: 0;
  }
  .ai-chat {
    width: 100%;
    height: 100%;
    border-radius: 0;
  }
  .chat-sidebar.sidebar-mobile {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 100%;
    z-index: 100;
    transform: translateX(-100%);
    &.sidebar-show {
      transform: translateX(0);
    }
  }
  .chat-header {
    padding: 12px;
    height: 52px;
    .header-info {
      .app-select {
        width: 100%;
        ::v-deep .el-input__inner {
          font-size: 14px;
          padding: 0 30px 0 10px;
        }
      }
    }
  }
  .message-container {
    padding: 16px 12px;
  }
  .welcome-panel {
    padding: 40px 16px;
    .welcome-icon {
      img {
        width: 48px;
        height: 48px;
      }
      i {
        font-size: 48px;
      }
    }
    h2 {
      font-size: 20px;
    }
  }
  .message-item {
    gap: 8px;
    margin-bottom: 20px;
    .message-avatar {
      width: 32px;
      height: 32px;
      font-size: 16px;
      > i {
        width: 32px;
        height: 32px;
      }
    }
    .message-content {
      max-width: calc(100% - 48px);
      padding: 10px 12px;
      .message-body {
        .message-markdown {
          font-size: 14px;
          ::v-deep {
            p {
              margin: 8px 0;
            }
            pre {
              margin: 8px 0;
              font-size: 13px;
            }
            code {
              font-size: 13px;
            }
          }
        }
      }
      .message-meta {
        font-size: 11px;
        padding-top: 8px;
        margin-top: 8px;
        .message-meta-item {
          margin-bottom: 6px;
        }
      }
    }
  }
  .input-area {
    padding: 10px 12px 16px;
    .input-toolbar {
      min-height: 32px;
      padding: 0 0 8px;
    }
    .input-row {
      padding: 10px;
    }
    .input-textarea {
      font-size: 14px;
      line-height: 22px;
      min-height: 22px;
    }
    .send-btn {
      width: 36px;
      height: 36px;
    }
    .input-tool-left {
      max-width: calc(100% - 46px);
    }
    .knowledge-select {
      width: 150px;
    }
  }
  .sidebar-footer {
    padding: 8px;
    ::v-deep .el-pagination {
      .btn-prev,
      .btn-next,
      .el-pager li {
        min-width: 28px;
        height: 28px;
        line-height: 28px;
        font-size: 12px;
      }
    }
  }
  .conversation-item {
    padding: 10px;
    .conv-title {
      font-size: 14px;
    }
    .conv-meta {
      font-size: 12px;
    }
  }
}
</style>
