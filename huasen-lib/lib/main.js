import "core-js";
import dayjs from "dayjs";
import * as tool from "./tool.js";
import {
  publicEncrypt,
  publicDecrypt,
  privateDecrypt,
  privateEncrypt,
  rsaEncryptLong,
  rsaDecryptLong,
} from "./rsa.js";
import { getAESSecret, decrypt, encrypt } from "./aes.js";
import { Validator, strategies } from "./strategy.js";
import { AF } from "./af.js";
import { flatAsync } from "./flatAsync.js";
import { getJSON, postJSON } from "./http.js";
import {
  TOKEN_VERSION,
  LICENSE_SYNCABLE_FAILURE_REASONS,
  normalizePem,
  stableStringify,
  sha256,
  createLicenseKeyHash,
  createAbilityHash,
  createPluginSourceHash,
  signLicenseToken,
  decodeLicenseToken,
  verifyLicenseToken,
  verifyLicenseTokenSignature,
  shouldRefreshLease,
  isLicenseSyncableFailureReason,
} from "./closed-source/license.js";

export {
  // RSA
  publicEncrypt,
  publicDecrypt,
  privateDecrypt,
  privateEncrypt,
  rsaEncryptLong,
  rsaDecryptLong,
  // AES
  getAESSecret,
  decrypt,
  encrypt,
  // 校验器
  Validator,
  strategies,
  // 工具
  tool,
  AF,
  dayjs,
  flatAsync,
  // HTTP
  postJSON,
  getJSON,
  // 授权
  TOKEN_VERSION,
  LICENSE_SYNCABLE_FAILURE_REASONS,
  normalizePem,
  stableStringify,
  sha256,
  createLicenseKeyHash,
  createAbilityHash,
  createPluginSourceHash,
  signLicenseToken,
  decodeLicenseToken,
  verifyLicenseToken,
  verifyLicenseTokenSignature,
  shouldRefreshLease,
  isLicenseSyncableFailureReason,
};
