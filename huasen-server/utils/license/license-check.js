/*
 * @Autor: huasenjio
 * @Date: 2026-05-05 00:00:00
 * @LastEditors: huasenjio
 * @LastEditTime: 2026-05-05 00:00:00
 * @Description: 授权可用性判断
 */

const { createLicenseKeyHash, verifyLicenseToken, decodeLicenseToken, tool } = require('huasen-lib');

function normalizeDateValue(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function normalizeStringArray(value = []) {
  return (Array.isArray(value) ? value : [])
    .filter(item => item !== undefined && item !== null && item !== '')
    .map(item => String(item))
    .sort();
}

function isSameStringArray(left = [], right = []) {
  const normalizedLeft = normalizeStringArray(left);
  const normalizedRight = normalizeStringArray(right);
  if (normalizedLeft.length !== normalizedRight.length) return false;
  return normalizedLeft.every((item, index) => item === normalizedRight[index]);
}

function buildTamperedResult(field, payload) {
  return {
    valid: false,
    reason: 'LICENSE_RECORD_TAMPERED',
    field,
    payload,
  };
}

function verifyLicenseRecordConsistency(licenseRecord, payload = {}, options = {}) {
  const recordLicenseKeyHash = createLicenseKeyHash(licenseRecord.licenseKey || '');
  if (!payload.licenseKeyHash || payload.licenseKeyHash !== recordLicenseKeyHash) return buildTamperedResult('licenseKeyHash', payload);

  const recordDomain = tool.getPrimaryDomain(licenseRecord.domain || '');
  const payloadDomain = tool.getPrimaryDomain(payload.domain || '');
  if (recordDomain !== payloadDomain) return buildTamperedResult('domain', payload);

  if (!isSameStringArray(licenseRecord.fingerprints || [], payload.fingerprints || [])) return buildTamperedResult('fingerprints', payload);

  if ((licenseRecord.type || '') !== (payload.type || '')) return buildTamperedResult('type', payload);
  if (normalizeDateValue(licenseRecord.expireAt) !== normalizeDateValue(payload.expireAt)) return buildTamperedResult('expireAt', payload);
  if (normalizeDateValue(licenseRecord.leaseExpireAt) !== normalizeDateValue(payload.leaseExpireAt)) return buildTamperedResult('leaseExpireAt', payload);

  const requiredFeatures = normalizeStringArray(options.features || (options.feature ? [options.feature] : ['ai-plugin']));
  const payloadFeatures = normalizeStringArray(payload.features || []);
  if (requiredFeatures.some(feature => !payloadFeatures.includes(feature))) return { valid: false, reason: 'FEATURE_UNAVAILABLE', field: 'features', payload };

  if (options.sourceVersion !== undefined && String(payload.sourceVersion || '') !== String(options.sourceVersion || '')) {
    return { valid: false, reason: 'SOURCE_VERSION_MISMATCH', field: 'sourceVersion', payload };
  }

  if (options.sourceHash !== undefined && String(payload.sourceHash || '') !== String(options.sourceHash || '')) {
    return { valid: false, reason: 'SOURCE_HASH_MISMATCH', field: 'sourceHash', payload };
  }

  if (options.abilityHash !== undefined && String(payload.abilityHash || '') !== String(options.abilityHash || '')) {
    return { valid: false, reason: 'ABILITY_HASH_MISMATCH', field: 'abilityHash', payload };
  }

  return { valid: true, reason: '', payload };
}

function verifyLocalLicense(licenseRecord, options = {}) {
  const { domain, fingerprint, publicKey, feature, sourceHash, abilityHash } = options;
  if (!licenseRecord) return { valid: false, reason: 'LICENSE_NOT_FOUND', payload: null };
  if (!licenseRecord.enabled) return { valid: false, reason: 'LICENSE_DISABLED', payload: null };
  if (options.requireLicenseToken && !licenseRecord.licenseToken) return { valid: false, reason: 'LICENSE_TOKEN_MISSING', payload: null };
  if (options.requireLicenseToken && !publicKey) return { valid: false, reason: 'PUBLIC_KEY_MISSING', payload: null };

  if (!options.ignoreLicenseToken && licenseRecord.licenseToken && publicKey) {
    const tokenResult = verifyLicenseToken(licenseRecord.licenseToken || '', publicKey || '', {
      domain,
      fingerprint,
      feature,
      sourceHash,
      abilityHash,
    });
    if (!tokenResult.valid) return tokenResult;
    return verifyLicenseRecordConsistency(licenseRecord, tokenResult.payload || {}, options);
  }

  const currentDomain = tool.getPrimaryDomain(domain || '');
  const recordDomain = tool.getPrimaryDomain(licenseRecord.domain || '');
  const domainMatch = Boolean(currentDomain && recordDomain && recordDomain === currentDomain);
  const fingerprintMatch = Boolean(fingerprint && (licenseRecord.fingerprints || []).includes(fingerprint));
  if (!domainMatch) return { valid: false, reason: 'DOMAIN_MISMATCH', payload: null };
  if (!fingerprintMatch) return { valid: false, reason: 'FINGERPRINT_MISMATCH', payload: null };

  const available = licenseRecord.type === 'permanent' ? true : Boolean(licenseRecord.expireAt && new Date(licenseRecord.expireAt) >= new Date());
  return { valid: available, reason: available ? '' : 'LICENSE_EXPIRED', payload: null };
}

function isLicenseAvailable(licenseRecord, domain, fingerprint, options = {}) {
  return verifyLocalLicense(licenseRecord, { ...options, domain, fingerprint }).valid;
}

function getLicenseTokenPayload(licenseRecord) {
  const decoded = decodeLicenseToken(licenseRecord ? licenseRecord.licenseToken : '');
  return decoded ? decoded.payload : null;
}

module.exports = { isLicenseAvailable, verifyLocalLicense, getLicenseTokenPayload, verifyLicenseRecordConsistency };
