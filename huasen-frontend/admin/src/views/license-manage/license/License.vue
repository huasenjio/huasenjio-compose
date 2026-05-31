<!--
 * @Autor: huasenjio
 * @Date: 2026-04-28 00:00:00
 * @LastEditors: huasenjio
 * @LastEditTime: 2026-04-28 00:00:00
 * @Description: 授权管理页面
-->
<template>
  <div class="license-manage">
    <el-card v-loading="loading" class="license-card" shadow="never">
      <div class="license-content">
        <!-- 未激活状态 -->
        <div v-if="!authorized" class="status-panel unauthorized-state">
          <div class="status-main">
            <div class="status-icon is-warning">
              <i class="el-icon-warning-outline"></i>
            </div>
            <div class="status-copy">
              <div class="status-eyebrow">当前版本</div>
              <h3 class="status-title">普通版</h3>
              <p class="status-desc">{{ licenseStatusMessage || '当前未激活高级版授权，AI 插件及能力配置等功能暂不可用。' }}</p>
            </div>
          </div>
          <div class="status-side">
            <div class="status-side__label">高级功能</div>
            <div class="status-side__value">待激活</div>
            <el-button v-if="shouldShowSyncAction" type="warning" size="medium" class="activate-btn" :loading="syncing" @click="handleSync"> 同步状态 </el-button>
            <el-button v-else type="primary" size="medium" class="activate-btn" @click="openActivateDialog"> 升级高级版 </el-button>
          </div>
        </div>

        <!-- 已激活状态 -->
        <div v-else class="status-panel authorized-state">
          <div class="authorized-summary">
            <div class="status-main">
              <div class="status-icon is-success">
                <i class="el-icon-medal"></i>
              </div>
              <div class="status-copy">
                <div class="status-eyebrow">当前版本</div>
                <h3 class="status-title">高级版已激活</h3>
                <p class="status-desc">AI 插件及能力配置等功能已解锁</p>
              </div>
            </div>
            <div class="status-side">
              <div class="status-side__label">授权类型</div>
              <div class="status-side__value">{{ licenseTypeLabel }}</div>
              <el-button type="default" size="small" @click="handleSync" :loading="syncing"> <i class="el-icon-refresh"></i> 同步状态 </el-button>
            </div>
          </div>
          <el-descriptions :column="2" border size="medium" class="license-descriptions">
            <el-descriptions-item label="授权类型">
              <el-tag :type="licenseTypeTag" size="small">{{ licenseTypeLabel }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="到期时间">
              <span v-if="license.expireAt">{{ license.expireAt | formatDate }}</span>
              <el-tag v-else type="success" size="small">永久有效</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="绑定域名">{{ license.domain || '-' }}</el-descriptions-item>
            <el-descriptions-item label="已注册设备">{{ license.fingerprintCount || 0 }} / 5</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="feature-panel">
          <div class="feature-panel__head">
            <div>
              <h3 class="feature-panel__title">版本功能对比</h3>
              <p class="feature-panel__desc">高级版能力以当前实例授权状态为准</p>
            </div>
            <el-tag size="small" :type="authorized ? 'success' : 'info'">{{ authorized ? '高级版' : '普通版' }}</el-tag>
          </div>
          <div class="feature-metrics">
            <div class="feature-metric">
              <span class="feature-metric__value">{{ basicFeatureCount }}</span>
              <span class="feature-metric__label">普通版功能</span>
            </div>
            <div class="feature-metric is-premium">
              <span class="feature-metric__value">{{ premiumOnlyCount }}</span>
              <span class="feature-metric__label">高级专属功能</span>
            </div>
            <div class="feature-metric">
              <span class="feature-metric__value">{{ premiumFeatureCount }}</span>
              <span class="feature-metric__label">全部功能</span>
            </div>
          </div>
          <el-table :data="featureComparison" border size="mini" class="feature-table" :row-class-name="getFeatureRowClass">
            <el-table-column prop="feature" label="功能"></el-table-column>
            <el-table-column label="效果图" width="86">
              <template slot-scope="{ row }">
                <el-popover v-if="row.previewImage || row.previewPlaceholder" placement="top" trigger="hover" popper-class="feature-preview-popover">
                  <img v-lazy v-if="row.previewImage" class="feature-preview__large" :src="row.previewImage" />
                  <div v-else class="feature-preview__placeholder is-large">
                    <i class="el-icon-picture-outline"></i>
                    <span>效果图占位</span>
                  </div>
                  <div slot="reference" class="feature-preview__thumb">
                    <img v-lazy v-if="row.thumbnailImage" :src="row.thumbnailImage" />
                    <div v-else class="feature-preview__placeholder">
                      <i class="el-icon-picture-outline"></i>
                    </div>
                  </div>
                </el-popover>
                <span v-else class="feature-preview__empty">-</span>
              </template>
            </el-table-column>
            <el-table-column label="普通版" width="148">
              <template slot-scope="{ row }">
                <span :class="getFeatureValueClass(row.basic)">
                  <i :class="getFeatureIconClass(row.basic)"></i>
                  {{ row.basic }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="高级版" width="148">
              <template slot-scope="{ row }">
                <span :class="getFeatureValueClass(row.premium)">
                  <i :class="getFeatureIconClass(row.premium)"></i>
                  {{ row.premium }}
                </span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-card>

    <!-- 激活弹窗 -->
    <HDialog
      v-if="showActivateDialog"
      title="激活高级版"
      width="420px"
      height="240px"
      :visible.sync="showActivateDialog"
      :close-on-click-modal="false"
      :buttons="{ comfirm: '立即激活', cancel: '取 消' }"
      @comfirmDialog="handleActivate"
      @cancelDialog="showActivateDialog = false"
    >
      <div class="activate-form">
        <el-form label-position="top">
          <el-form-item label="授权码">
            <el-input v-model="licenseKeyInput" placeholder="请输入授权码（如：HSM1-xxxxxxxx-xxxxxxxx-xx）" clearable @keyup.enter.native="handleActivate"> </el-input>
          </el-form-item>
        </el-form>
        <div class="activate-tip">
          <i class="el-icon-info"></i>
          请联系
          <a href="https://www.huasenjio.top/" target="_blank">官方渠道</a>
          获取授权码
        </div>
      </div>
    </HDialog>
  </div>
</template>

<script>
import { isLicenseSyncableFailureReason } from 'huasen-lib';
import HDialog from '@huasen/ui/src/components/Dialog.vue';

const TYPE_LABEL_MAP = {
  monthly: '月度',
  yearly: '年度',
  permanent: '永久',
};
const TYPE_TAG_MAP = {
  monthly: 'warning',
  yearly: 'success',
  permanent: '',
};

export default {
  name: 'LicensePanel',
  components: { HDialog },
  data() {
    return {
      loading: false,
      authorized: false,
      license: null,
      licenseStatusMessage: '',
      licenseReason: '',
      syncing: false,
      showActivateDialog: false,
      licenseKeyInput: '',
      featureComparison: [
        { feature: '后台基础管理', basic: '支持', premium: '支持' },
        { feature: 'AI 供应商 / 应用 / 模型预设配置', basic: '支持', premium: '支持' },
        { feature: 'AI 插件动态加载', basic: '不支持', premium: '支持' },
        {
          feature: 'AI 插件能力-站点智能填充',
          basic: '不支持',
          premium: '支持',
          previewPlaceholder: true,
          previewImage: 'https://www.huasenjio.top/huasen-store/default/site-fill-20260525230000.png',
          thumbnailImage: 'https://www.huasenjio.top/huasen-store/default/site-smart-fill-20260511202018.png',
        },
        {
          feature: 'AI 插件能力-查找同类站点',
          basic: '不支持',
          premium: '支持',
          previewPlaceholder: true,
          previewImage: 'https://www.huasenjio.top/huasen-store/default/site-find-20260525225958.png',
          thumbnailImage: 'https://www.huasenjio.top/huasen-store/default/site-find-similar-20260511202020.png',
        },
        {
          feature: 'AI 插件能力-站点详情页补全',
          basic: '不支持',
          premium: '支持',
          previewPlaceholder: true,
          previewImage: 'https://www.huasenjio.top/huasen-store/default/site-detail-20260525225957.png',
          thumbnailImage: 'https://www.huasenjio.top/huasen-store/default/site-detail-complete-20260511202017.png',
        },
        { feature: '网站版权声明移除', basic: '不支持', premium: '支持' },
      ],
    };
  },
  computed: {
    licenseTypeLabel() {
      return this.license ? TYPE_LABEL_MAP[this.license.type] || this.license.type : '';
    },
    licenseTypeTag() {
      return this.license ? TYPE_TAG_MAP[this.license.type] || 'info' : 'info';
    },
    basicFeatureCount() {
      return this.featureComparison.filter(item => item.basic === '支持').length;
    },
    premiumFeatureCount() {
      return this.featureComparison.filter(item => item.premium === '支持').length;
    },
    premiumOnlyCount() {
      return this.featureComparison.filter(item => item.basic !== item.premium).length;
    },
    shouldShowSyncAction() {
      return isLicenseSyncableFailureReason(this.licenseReason);
    },
  },
  mounted() {
    this.init();
  },
  activated() {
    this.init();
  },
  methods: {
    init() {
      this.queryStatus();
    },
    queryStatus() {
      this.loading = true;
      this.API.ai
        .getLicenseStatus({}, { notify: false })
        .then(res => {
          this.authorized = res.data && res.data.authorized;
          this.license = res.data && res.data.license;
          this.licenseStatusMessage = (res.data && res.data.message) || '';
          this.licenseReason = (res.data && res.data.reason) || '';
        })
        .finally(() => {
          this.loading = false;
        });
    },
    openActivateDialog() {
      this.licenseKeyInput = '';
      this.showActivateDialog = true;
    },
    handleActivate() {
      const key = this.licenseKeyInput.trim();
      if (!key) {
        this.$message.warning('请输入授权码');
        return;
      }
      this.API.ai.activateLicense({ licenseKey: key }, { notify: false }).then(res => {
        this.$tips('success', '高级版激活成功，即将刷新页面！', 'top-right', 1200, () => {
          window.location.reload();
        });
      });
    },
    handleSync() {
      this.$confirm('手动同步会从官方覆盖授权状态（包含：授权码、机器指纹、授权类型）、AI 插件及能力配置（包含：绑定应用、默认提示词），是否继续？', '同步确认', {
        confirmButtonText: '继续同步',
        cancelButtonText: '取 消',
        type: 'warning',
      })
        .then(() => {
          this.syncing = true;
          return this.API.ai.syncLicense({}, { notify: false });
        })
        .then(() => {
          if (!this.syncing) return;
          this.$message.success('同步成功');
          this.queryStatus();
        })
        .catch(err => {
          if (err === 'cancel' || err === 'close') return;
          this.$message.error(this.LODASH.get(err, 'msg') || '同步失败');
        })
        .finally(() => {
          this.syncing = false;
        });
    },
    getFeatureValueClass(value) {
      if (value === '支持') return 'feature-value is-supported';
      if (value === '不支持') return 'feature-value is-disabled';
      return 'feature-value';
    },
    getFeatureIconClass(value) {
      return value === '支持' ? 'el-icon-check' : 'el-icon-close';
    },
    getFeatureRowClass({ row }) {
      return row.basic !== row.premium ? 'is-premium-row' : '';
    },
  },
  filters: {
    formatDate(val) {
      if (!val) return '-';
      const d = new Date(val);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    },
  },
};
</script>

<style lang="scss" scoped>
.license-manage {
  width: 100%;
  height: 100%;
}

.license-card {
  height: 100%;
  border-color: transparent;
  border-radius: 0px;

  ::v-deep .el-card__body {
    height: 100%;
    overflow-y: auto;
  }
}

.license-content {
  max-width: 940px;
  min-height: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
  padding: 20px 0;
}

.status-panel,
.feature-panel {
  width: 100%;
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  background: var(--gray-0);
  box-shadow: 0 10px 24px var(--gray-100);
}

/* 未激活状态 */
.unauthorized-state {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
  min-height: 180px;
  padding: 28px 32px;
  background: linear-gradient(135deg, var(--gray-0) 0%, var(--gray-50) 100%);
}

.status-main {
  display: flex;
  align-items: center;
  gap: 18px;
  min-width: 0;
}

.status-icon {
  flex-shrink: 0;
  width: 58px;
  height: 58px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.status-icon.is-warning {
  color: var(--yellow-500);
  background: var(--yellow-50);
  border: 1px solid var(--yellow-100);
}

.status-icon.is-success {
  color: var(--green-500);
  background: var(--green-50);
  border: 1px solid var(--green-100);
}

.status-copy {
  min-width: 0;
}

.status-eyebrow {
  font-size: 12px;
  color: var(--gray-400);
  margin-bottom: 6px;
}

.status-title {
  font-size: 22px;
  line-height: 30px;
  color: var(--gray-800);
  margin: 0 0 6px;
}

.status-desc {
  font-size: 13px;
  color: var(--gray-500);
  margin: 0;
}

.status-side {
  flex-shrink: 0;
  min-width: 160px;
  padding-left: 24px;
  border-left: 1px solid var(--gray-200);
  text-align: right;
}

.status-side__label {
  font-size: 12px;
  color: var(--gray-400);
  margin-bottom: 6px;
}

.status-side__value {
  font-size: 18px;
  font-weight: bold;
  color: var(--gray-800);
  margin-bottom: 14px;
}

.activate-btn {
  padding: 10px 32px;
}

/* 已激活状态 */
.authorized-state {
  padding: 24px 28px;
  background: linear-gradient(135deg, var(--gray-0) 0%, var(--green-50) 100%);
}

.authorized-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
  margin-bottom: 18px;
}

.license-descriptions {
  margin-bottom: 0;
}

.feature-panel {
  padding: 20px 22px 22px;
}

.feature-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.feature-panel__title {
  font-size: 16px;
  font-weight: bold;
  margin: 0;
  color: var(--gray-800);
}

.feature-panel__desc {
  font-size: 12px;
  color: var(--gray-400);
  margin: 6px 0 0;
}

.feature-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

.feature-metric {
  padding: 12px 14px;
  border: 1px solid var(--gray-200);
  border-radius: 6px;
  background: var(--gray-50);
}

.feature-metric.is-premium {
  background: var(--green-50);
  border-color: var(--green-100);
}

.feature-metric__value {
  display: block;
  font-size: 22px;
  line-height: 28px;
  font-weight: bold;
  color: var(--gray-800);
}

.feature-metric__label {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: var(--gray-400);
}

.feature-table {
  width: 100%;

  ::v-deep .el-table__header th {
    background: var(--gray-50);
    color: var(--gray-500);
    font-weight: 600;
  }

  ::v-deep .is-premium-row td {
    background: var(--green-50);
  }
}

.feature-value {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
}

.feature-value.is-supported {
  color: var(--green-600);
  font-weight: 500;
}

.feature-value.is-disabled {
  color: var(--gray-300);
}

.feature-preview__thumb {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
}

.feature-preview__thumb img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.feature-preview__large {
  display: block;
  width: auto;
  max-width: 560px;
  max-height: 420px;
  object-fit: contain;
  border-radius: 4px;
  background: var(--gray-50);
}

.feature-preview__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-400);
  background: var(--gray-50);
}

.feature-preview__placeholder.is-large {
  flex-direction: column;
  gap: 8px;
  border: 1px dashed var(--gray-200);
  border-radius: 4px;
  font-size: 12px;
}

.feature-preview__placeholder.is-large i {
  font-size: 32px;
}

.feature-preview__empty {
  color: var(--gray-300);
}

::v-deep .feature-preview-popover {
  width: auto !important;
  min-width: 0;
}

@media (max-width: 900px) {
  .unauthorized-state,
  .authorized-summary {
    align-items: flex-start;
    flex-direction: column;
  }

  .status-side {
    width: 100%;
    padding-left: 0;
    padding-top: 16px;
    border-left: 0;
    border-top: 1px solid var(--gray-200);
    text-align: left;
  }

  .feature-metrics {
    grid-template-columns: 1fr;
  }
}

/* 激活弹窗 */
.activate-form {
  padding: 10px 0;
}

.activate-tip {
  font-size: 12px;
  color: var(--gray-400);
  margin-top: 10px;

  i {
    margin-right: 4px;
    color: var(--yellow-500);
  }
}
</style>
