const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const { tool } = require('huasen-lib');
const { parseDocument, isSupportedFormat } = require('../document-parser.js');

// Site origin for resolving relative URLs
let SITE_ORIGIN = '';
try {
  const setting = require('../../setting.json');
  SITE_ORIGIN = _.get(setting, 'site.origin', '');
} catch (err) {
  SITE_ORIGIN = '';
}

const DEFAULT_CAPABILITIES = {
  supportsImageInput: false,
  supportsDocumentInline: false,
  supportsTextFallback: true,
};

/**
 * Resolve provider capabilities from configuration
 * @param {Object} provider - AI provider document
 * @param {Object} preset - AI preset document
 * @param {Object} app - AI app document
 * @returns {Object} Capabilities object
 */
function resolveCapabilities(provider, preset, app) {
  const extraConfig = tool.parseJSON(_.get(provider, 'extraConfig', '{}'), Object, {});
  const legacyCaps = _.get(extraConfig, 'capabilities', {});
  return {
    supportsImageInput: _.get(provider, 'supportsImageInput', _.get(legacyCaps, 'supportsImageInput', DEFAULT_CAPABILITIES.supportsImageInput)),
    supportsDocumentInline: _.get(provider, 'supportsDocumentInline', _.get(legacyCaps, 'supportsDocumentInline', DEFAULT_CAPABILITIES.supportsDocumentInline)),
    supportsTextFallback: _.get(provider, 'supportsTextFallback', _.get(legacyCaps, 'supportsTextFallback', DEFAULT_CAPABILITIES.supportsTextFallback)),
  };
}

/**
 * Resolve relative attachment URL to absolute URL
 * @param {string} relativeUrl - Relative URL like /huasen-store/ai/xxx
 * @returns {string} Absolute or relative URL
 */
function resolveAttachmentUrl(relativeUrl = '') {
  if (!relativeUrl) return '';
  if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
    return relativeUrl;
  }
  const origin = SITE_ORIGIN;
  if (!origin) return relativeUrl;
  return `${origin.replace(/\/+$/, '')}${relativeUrl}`;
}

/**
 * MIME type mapping for common image extensions
 */
const MIME_TYPE_MAP = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.bmp': 'image/bmp',
  '.ico': 'image/x-icon',
};

/**
 * Normalize MIME type to standard image format
 * Handles non-standard MIME types reported by some servers (e.g. SVG as "text/xml")
 */
const NORMALIZE_MIME_MAP = {
  'text/xml': 'image/svg+xml',
  'text/xml; charset=utf-8': 'image/svg+xml',
  'application/xml': 'image/svg+xml',
  'application/xml; charset=utf-8': 'image/svg+xml',
};

/**
 * Derive MIME type from file extension
 * @param {string} ext - File extension (e.g. ".jpg", ".webp")
 * @returns {string} MIME type
 */
function getMimeTypeFromExt(ext) {
  const lower = (ext || '').toLowerCase();
  return MIME_TYPE_MAP[lower] || 'image/png';
}

/**
 * Convert image attachment to base64 data URI
 * Reads from local disk using the attachment's path field
 * @param {Object} img - Attachment document
 * @returns {string} data:image/xxx;base64,... data URI
 */
function resolveImageAsBase64(img) {
  // img.path is like "huasen-store/ai/xxx.png", strip the store prefix before joining
  const storeRoot = path.resolve(__dirname, '../../../huasen-store/');
  const relativePath = img.path.replace(/^huasen-store\//, '');
  const filePath = path.join(storeRoot, relativePath);
  if (!fs.existsSync(filePath)) {
    throw new Error(`图片文件不存在: ${filePath}`);
  }
  const stats = fs.statSync(filePath);
  const sizeMB = stats.size / (1024 * 1024);
  if (sizeMB > 10) {
    throw new Error(`图片文件过大 (${sizeMB.toFixed(2)}MB)，多模态模型支持的图片需小于 10MB`);
  }
  const buffer = fs.readFileSync(filePath);
  const base64 = buffer.toString('base64');
  // 优先用上传时记录的 mimeType，其次从扩展名推断，最后兜底 png
  let mimeType = img.mimeType || getMimeTypeFromExt(img.ext) || 'image/png';
  // 归一化非标准 MIME 类型（如：SVG 可能被上报为 text/xml）
  mimeType = NORMALIZE_MIME_MAP[mimeType] || mimeType;
  return `data:${mimeType};base64,${base64}`;
}

/**
 * 文件只有在供应商开启 supportsDocumentInline 时才解析为文本，否则只降级为文件名和链接。
 * @param {Array} attachments - Attachment documents
 * @param {Object} caps - Provider capabilities
 * @returns {Promise<string>} Text representation
 */
async function buildAttachmentContent(attachments = [], caps = {}) {
  const results = [];
  const canParseDocument = !!caps.supportsDocumentInline;

  for (const item of attachments) {
    const url = item.url || '';

    if (item.kind === 'image') {
      results.push(`[图片附件] ${item.name} ${url}`.trim());
    } else if (item.kind === 'file') {
      if (canParseDocument && isSupportedFormat(item.ext)) {
        try {
          const storeRoot = path.resolve(__dirname, '../../../huasen-store/');
          const relativePath = item.path.replace(/^huasen-store\//, '');
          const filePath = path.join(storeRoot, relativePath);

          const content = await parseDocument(filePath, item.ext, { maxLength: 50000 });
          results.push(`[文件附件: ${item.name}]\n${content}`);
        } catch (err) {
          // 解析失败时回退到文件名 + URL
          results.push(`[文件附件] ${item.name} ${url}`.trim());
        }
      } else {
        // 未开启文档解析或格式不支持时，只显示文件名和链接。
        results.push(`[文件附件] ${item.name} ${url}`.trim());
      }
    }
  }

  return results.filter(Boolean).join('\n\n');
}

/**
 * Build text fallback message (current behavior)
 * @param {Object} item - Runtime message item
 * @param {Object} caps - Provider capabilities
 * @returns {Promise<Object>} OpenAI format message
 */
async function buildTextFallbackMessage(item, caps = {}) {
  const { role, content, attachments = [] } = item;
  const parts = [];
  if (content) {
    parts.push(content);
  }
  if (attachments.length) {
    const attachmentContent = await buildAttachmentContent(attachments, caps);
    parts.push(attachmentContent);
  }
  return {
    role,
    content: parts.filter(Boolean).join('\n\n'),
  };
}

/**
 * Build multimodal content array for image support
 * @param {Object} item - Runtime message item
 * @param {Object} caps - Capabilities
 * @param {Object} preset - AI preset document
 * @returns {Promise<Object|null>} OpenAI format message or null if not applicable
 */
async function buildMultimodalMessage(item, caps, preset) {
  const { role, content, attachments = [] } = item;

  // Only apply to user messages with image attachments
  if (role !== 'user') return null;

  const imageAttachments = attachments.filter(a => a.kind === 'image');
  const fileAttachments = attachments.filter(a => a.kind === 'file');
  if (imageAttachments.length === 0) return null;

  // Check capability
  if (!caps.supportsImageInput) return null;

  const contentParts = [];

  // Add text content if present
  if (content) {
    contentParts.push({ type: 'text', text: content });
  }

  if (fileAttachments.length > 0) {
    if (!caps.supportsTextFallback) {
      throw new Error('当前AI供应商不支持文件附件文本降级传输');
    }
    const fileContent = await buildAttachmentContent(fileAttachments, caps);
    contentParts.push({ type: 'text', text: fileContent });
  }

  // Add image content
  const useBase64 = preset && preset.imageAsBase64;
  imageAttachments.forEach(img => {
    let imageUrl;
    if (useBase64) {
      // Base64 data URI: 绕过公网 URL 访问限制
      imageUrl = resolveImageAsBase64(img);
    } else {
      // URL 方式: 需要供应商服务器能访问到该地址
      imageUrl = resolveAttachmentUrl(img.url || img.path || '');
    }
    contentParts.push({
      type: 'image_url',
      image_url: { url: imageUrl },
    });
  });

  // If only one part and it's text, return simple string format
  if (contentParts.length === 1 && contentParts[0].type === 'text') {
    return { role, content: contentParts[0].text };
  }

  return { role, content: contentParts };
}

/**
 * Build a single message in OpenAI format
 * @param {Object} item - Runtime message item
 * @param {Object} caps - Capabilities
 * @param {Object} preset - AI preset document
 * @returns {Promise<Object>} OpenAI format message
 */
async function buildMessage(item, caps, preset) {
  const { role, attachments = [] } = item;

  // System and assistant messages are always text-only
  if (role === 'system' || role === 'assistant') {
    return { role, content: item.content || '' };
  }

  const hasAttachments = attachments.length > 0;

  // User message: try multimodal first
  const multimodal = await buildMultimodalMessage(item, caps, preset);
  if (multimodal) {
    return multimodal;
  }

  if (hasAttachments && !caps.supportsTextFallback) {
    throw new Error('当前AI供应商不支持附件文本降级传输');
  }

  // Text fallback for user messages
  return await buildTextFallbackMessage(item, caps);
}

/**
 * Build provider messages from runtime messages
 * @param {Object} params
 * @param {Array} params.runtimeMessages - Runtime message items
 * @param {Object} params.provider - AI provider document
 * @param {Object} params.preset - AI preset document
 * @param {Object} params.app - AI app document
 * @returns {Promise<Array>} OpenAI format messages
 */
async function buildProviderMessages({ runtimeMessages, provider, preset, app }) {
  const caps = resolveCapabilities(provider, preset, app);
  const messages = [];

  for (const item of runtimeMessages) {
    const message = await buildMessage(item, caps, preset);
    messages.push(message);
  }

  return messages;
}

module.exports = {
  resolveCapabilities,
  resolveAttachmentUrl,
  resolveImageAsBase64,
  buildAttachmentContent,
  buildTextFallbackMessage,
  buildMultimodalMessage,
  buildProviderMessages,
  DEFAULT_CAPABILITIES,
};
