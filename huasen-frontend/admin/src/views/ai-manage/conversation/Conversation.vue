<!--
 * @Autor: huasenjio
 * @Date: 2026-05-06 00:00:00
 * @LastEditors: huasenjio
 * @LastEditTime: 2026-05-06 00:00:00
 * @Description: AI 对话记录管理
-->

<template>
  <div class="conversation-manage">
    <TableList
      ref="tableList"
      :tableData="tableData"
      :tableMap="tableMap"
      :formMap="searchFormMap"
      :total="total"
      :showAdd="false"
      :showEdit="false"
      :showDetail="true"
      :showRemove="true"
      :showSelection="true"
      :showRemoveMany="true"
      :operationWidth="180"
      @detail="handleDetail"
      @remove="handleRemove"
      @removeMany="handleRemoveMany"
      @search="queryData"
      @paginationChange="paginationChange"
      @updatePagination="updatePagination"
    ></TableList>

    <HDialog v-if="showDetail" title="对话详情" width="900px" height="520px" maxHeight="520px" :visible.sync="showDetail" @cancelDialog="closeDetail" @close="closeDetail">
      <div class="detail-wrap">
        <el-descriptions v-if="currentConversation" class="conversation-summary" :column="2" border size="small">
          <el-descriptions-item label="会话ID">{{ currentConversation._id }}</el-descriptions-item>
          <el-descriptions-item label="用户ID">{{ currentConversation.userId }}</el-descriptions-item>
          <el-descriptions-item label="标题">{{ currentConversation.title || '-' }}</el-descriptions-item>
          <el-descriptions-item label="来源">{{ currentConversation.source || '-' }}</el-descriptions-item>
          <el-descriptions-item label="应用ID">{{ currentConversation.appId || '-' }}</el-descriptions-item>
          <el-descriptions-item label="知识包">{{ getKnowledgePackText(currentConversation) }}</el-descriptions-item>
          <el-descriptions-item label="消息数">{{ currentConversation.messageCount || 0 }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(currentConversation.creatTime) }}</el-descriptions-item>
          <el-descriptions-item label="最后消息">{{ formatDate(currentConversation.lastMessageAt) }}</el-descriptions-item>
        </el-descriptions>

        <div class="message-table-wrap">
          <el-table v-loading="messageLoading" class="message-table" :data="messages" border stripe height="100%">
            <el-table-column prop="role" label="角色" width="100"></el-table-column>
            <el-table-column prop="status" label="状态" width="100"></el-table-column>
            <el-table-column prop="model" label="模型" width="140"></el-table-column>
            <el-table-column label="内容" min-width="300">
              <template slot-scope="scope">
                <div class="message-content">{{ scope.row.content || '-' }}</div>
                <div v-if="scope.row.attachments && scope.row.attachments.length" class="message-attachments">
                  <el-collapse class="attachment-collapse">
                    <el-collapse-item :title="`附件 ${scope.row.attachments.length} 个`" :name="scope.row._id">
                      <div v-for="attachment in scope.row.attachments" :key="attachment._id" class="attachment-item">
                        <span class="attachment-icon">
                          <i :class="attachment.kind === 'image' ? 'el-icon-picture-outline' : 'el-icon-document'"></i>
                        </span>
                        <div class="attachment-main">
                          <a v-if="attachment.url" class="attachment-name" :href="attachment.url" target="_blank">{{ attachment.name || attachment.url }}</a>
                          <span v-else class="attachment-name">{{ attachment.name || '-' }}</span>
                          <span class="attachment-meta">{{ attachment.mimeType || attachment.ext || '未知类型' }} · {{ formatSize(attachment.size) }}</span>
                        </div>
                      </div>
                    </el-collapse-item>
                  </el-collapse>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="创建时间" width="170">
              <template slot-scope="scope">{{ formatDate(scope.row.creatTime) }}</template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </HDialog>
  </div>
</template>

<script>
import { tool } from 'huasen-lib';
import { HDialog } from '@huasen/ui';
import TableList from '@/components/content/table-list/TableList.vue';

const SOURCE_OPTIONS = [
  { label: '门户端', value: 'portal' },
  { label: '插件', value: 'plugin' },
];

export default {
  name: 'ConversationManage',
  components: { TableList, HDialog },
  data() {
    return {
      tableData: [],
      total: 0,
      tableMap: [
        { label: '标题', key: 'title' },
        { label: '用户ID', key: 'userId' },
        { label: '应用ID', key: 'appId' },
        { label: '知识包', key: 'knowledgePackText' },
        { label: '来源', key: 'source' },
        { label: '消息数', key: 'messageCount' },
        { label: '最后消息', key: 'lastMessageAt' },
        { label: '创建时间', key: 'creatTime' },
      ],
      searchFormMap: [
        { label: '标题', type: 'input', key: 'title', value: '', show: true },
        { label: '用户ID', type: 'input', key: 'userId', value: '', show: true },
        { label: '应用ID', type: 'input', key: 'appId', value: '', show: false },
        { label: '创建时间', type: 'date-picker', key: 'creatTime', value: undefined, show: false },
        {
          label: '来源',
          type: 'select',
          key: 'source',
          value: undefined,
          show: false,

          typeConfig: { options: SOURCE_OPTIONS },
        },
      ],
      pageNo: 1,
      pageSize: 10,
      showDetail: false,
      currentConversation: null,
      messages: [],
      messageLoading: false,
    };
  },
  activated() {
    this.init();
  },
  methods: {
    init() {
      this.queryData();
    },
    queryData() {
      let formData = this.$refs.tableList.getFormData();
      let params = Object.assign({ pageNo: this.pageNo, pageSize: this.pageSize }, formData);
      this.API.ai.findManageConversationByPage(params, { notify: false }).then(res => {
        this.tableData = (res.data.list || []).map(item => ({
          ...item,
          knowledgePackText: this.getKnowledgePackText(item),
        }));
        this.total = res.data.total || 0;
      });
    },
    updatePagination(pageNo, pageSize) {
      this.pageNo = pageNo;
      this.pageSize = pageSize;
    },
    paginationChange() {
      this.queryData();
    },
    handleDetail(index, row) {
      this.currentConversation = row;
      this.showDetail = true;
      this.messageLoading = true;
      this.API.ai
        .findManageMessageByConversation({ conversationId: row._id }, { notify: false })
        .then(res => {
          this.messages = res.data || [];
        })
        .finally(() => {
          this.messageLoading = false;
        });
    },
    handleRemove(index, row) {
      this.API.ai.removeManageConversation({ _id: row._id }).then(() => {
        this.queryData();
      });
    },
    handleRemoveMany(selection) {
      if (!selection || selection.length === 0) {
        this.$message.warning('请选择要删除的会话');
        return;
      }
      const _ids = selection.map(item => item._id);
      this.API.ai
        .removeManyManageConversation({ _ids })
        .then(() => {
          // this.$message.success('批量删除成功');
          this.queryData();
        })
        .catch(() => {
          // this.$message.error('批量删除失败');
        });
    },
    closeDetail() {
      this.showDetail = false;
      this.currentConversation = null;
      this.messages = [];
    },
    formatDate(date) {
      return date ? tool.formatDate(date, 'YYYY-MM-DD HH:mm:ss') : '-';
    },
    formatSize(size) {
      const value = Number(size) || 0;
      if (value >= 1024 * 1024) return `${(value / 1024 / 1024).toFixed(2)} MB`;
      if (value >= 1024) return `${(value / 1024).toFixed(2)} KB`;
      return `${value} B`;
    },
    getKnowledgePackText(conversation) {
      const names = conversation && Array.isArray(conversation.knowledgePackNames) ? conversation.knowledgePackNames : [];
      return names.length ? names.join('、') : '--';
    },
  },
};
</script>

<style lang="scss" scoped>
.conversation-manage {
  width: 100%;
  height: 100%;
}

.detail-wrap {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow: hidden;
}

.conversation-summary {
  flex: 0 0 auto;
}

.message-table-wrap {
  flex: 1;
  min-height: 0;
}

.message-table {
  width: 100%;
  height: 100%;
}

.message-content {
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.message-attachments {
  margin-top: 8px;
}

.attachment-collapse {
  border-top: 1px solid var(--gray-100);
  border-bottom: 0;

  ::v-deep .el-collapse-item__header {
    height: 30px;
    line-height: 30px;
    border-bottom: 0;
    color: var(--gray-600);
    font-size: 12px;
    background: transparent;
  }

  ::v-deep .el-collapse-item__wrap {
    border-bottom: 0;
    background: transparent;
  }

  ::v-deep .el-collapse-item__content {
    padding-bottom: 0;
  }
}

.attachment-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid var(--gray-100);
  border-radius: 4px;
  background: var(--gray-50);
  font-size: 12px;

  & + .attachment-item {
    margin-top: 6px;
  }
}

.attachment-icon {
  flex: 0 0 auto;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: var(--ui-theme);
  background: #fff;
  border: 1px solid var(--gray-100);
}

.attachment-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.attachment-name {
  color: var(--gray-800);
  word-break: break-all;
}

.attachment-meta {
  color: var(--gray-500);
}
</style>
