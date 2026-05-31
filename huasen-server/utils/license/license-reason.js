const LICENSE_REASON_MESSAGE_MAP = {
  LICENSE_NOT_FOUND: '没有授权记录，请先激活授权',
  LICENSE_DISABLED: '授权已停用',
  TOKEN_MALFORMED: '授权票据格式无效，请前往授权管理同步状态',
  LICENSE_TOKEN_MISSING: '缺少授权票据，请前往授权管理同步状态',
  PUBLIC_KEY_MISSING: '授权公钥缺失',
  TOKEN_INVALID_SIGNATURE: '授权票据签名无效，请前往授权管理同步状态',
  DOMAIN_MISMATCH: '授权域名不匹配',
  FINGERPRINT_MISMATCH: '设备指纹不匹配',
  FEATURE_UNAVAILABLE: '当前授权不包含此功能',
  LICENSE_EXPIRED: '授权已过期',
  LEASE_EXPIRED: '授权租约已过期，请前往授权管理同步状态',
  LICENSE_RECORD_TAMPERED: '本地授权记录与官方票据不一致，请前往授权管理同步状态',
  SOURCE_VERSION_MISMATCH: '插件源码版本已变化，请前往授权管理同步状态',
  SOURCE_HASH_MISMATCH: '插件源码快照已变化，请前往授权管理同步状态',
  ABILITY_HASH_MISMATCH: 'AI 能力配置已变化，请前往授权管理同步状态',
  NO_FINGERPRINT: '实例指纹不可用',
};

function getLicenseReasonMessage(reason, fallback = '') {
  return LICENSE_REASON_MESSAGE_MAP[reason] || fallback || reason || '';
}

module.exports = {
  LICENSE_REASON_MESSAGE_MAP,
  getLicenseReasonMessage,
};
