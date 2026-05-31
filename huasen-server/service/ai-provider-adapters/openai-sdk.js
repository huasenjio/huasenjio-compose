const OpenAI = require('openai');
const _ = require('lodash');

// Client cache: providerId -> client instance
const clientCache = new Map();

function buildClientCacheKey(provider, extraConfig = {}) {
  return JSON.stringify({
    id: String(provider._id),
    baseURL: normalizeBaseUrl(provider.baseUrl),
    apiKey: provider.apiKey,
    defaultHeaders: extraConfig.defaultHeaders || {},
    defaultQuery: extraConfig.defaultQuery || {},
    timeout: extraConfig.timeout || 180000,
    maxRetries: extraConfig.maxRetries || 0,
  });
}

/**
 * Create or retrieve cached OpenAI SDK client
 * @param {Object} provider - AI provider document from MongoDB
 * @param {Object} extraConfig - Parsed extraConfig object
 * @returns {OpenAI} OpenAI SDK client instance
 */
function createOpenAIClient(provider, extraConfig = {}) {
  const key = buildClientCacheKey(provider, extraConfig);
  if (clientCache.has(key)) {
    return clientCache.get(key);
  }

  const client = new OpenAI({
    baseURL: normalizeBaseUrl(provider.baseUrl),
    apiKey: provider.apiKey,
    defaultHeaders: extraConfig.defaultHeaders || {},
    defaultQuery: extraConfig.defaultQuery || {},
    timeout: extraConfig.timeout || 120000,
    maxRetries: extraConfig.maxRetries || 0,
  });

  clientCache.set(key, client);
  return client;
}

/**
 * Normalize base URL by removing trailing slashes
 * @param {string} baseUrl
 * @returns {string}
 */
function normalizeBaseUrl(baseUrl = '') {
  return String(baseUrl || '').replace(/\/+$/, '');
}

/**
 * Normalize OpenAI SDK response to unified format
 * @param {Object} response - OpenAI SDK response
 * @returns {Object} Normalized result
 */
function normalizeResponse(response) {
  const choice = _.get(response, 'choices[0]', {});
  const message = _.get(choice, 'message', {});
  return {
    content: extractContent(message.content),
    usage: _.get(response, 'usage', {}),
    finishReason: _.get(choice, 'finish_reason', ''),
    model: _.get(response, 'model', ''),
    raw: response,
  };
}

/**
 * Extract text content from various content formats
 * @param {*} content
 * @returns {string}
 */
function extractContent(content) {
  if (typeof content === 'string') {
    return content;
  }
  if (Array.isArray(content)) {
    return content
      .map(item => {
        if (typeof item === 'string') return item;
        if (item && item.type === 'text') return item.text || '';
        return '';
      })
      .filter(Boolean)
      .join('\n');
  }
  return '';
}

/**
 * Map OpenAI SDK error to standard Error
 * @param {Error} err
 * @returns {Error}
 */
function mapError(err) {
  const message = _.get(err, 'error.message') || _.get(err, 'message') || 'AI 服务调用失败';
  return new Error(message);
}

/**
 * Invoke provider in non-streaming mode
 * @param {OpenAI} client - OpenAI SDK client
 * @param {Object} payload - Request payload
 * @returns {Promise<Object>} Normalized response
 */
async function invokeNonStream(client, payload) {
  try {
    const response = await client.chat.completions.create({
      ...payload,
      stream: false,
    });
    return normalizeResponse(response);
  } catch (err) {
    throw mapError(err);
  }
}

/**
 * Invoke provider in streaming mode
 * @param {OpenAI} client - OpenAI SDK client
 * @param {Object} payload - Request payload
 * @param {Object} handlers - Event handlers
 * @returns {Object} { abort: Function, result: Promise }
 */
function invokeStream(client, payload, handlers = {}) {
  const controller = new AbortController();
  let accumulatedContent = '';
  let settled = false;
  let resolveResult, rejectResult;
  let streamInstance = null;

  const result = new Promise((resolve, reject) => {
    resolveResult = resolve;
    rejectResult = reject;
  });

  function resolveOnce(data) {
    if (!settled) {
      settled = true;
      resolveResult(data);
    }
  }

  function rejectOnce(err) {
    if (!settled) {
      settled = true;
      rejectResult(err instanceof Error ? err : new Error(String(err || 'AI 服务调用失败')));
    }
  }

  async function abortStreamInstance() {
    if (!streamInstance) return;
    if (typeof streamInstance.abort === 'function') {
      await streamInstance.abort();
      return;
    }
    if (typeof streamInstance.controller.abort === 'function') {
      streamInstance.controller.abort();
    }
  }

  client.chat.completions
    .create({ ...payload, stream: true }, { signal: controller.signal })
    .then(async stream => {
      streamInstance = stream;
      try {
        let usage = {};
        let finishReason = '';
        let model = '';
        let chunkCount = 0;

        for await (const chunk of stream) {
          if (controller.signal.aborted) {
            break;
          }
          chunkCount++;

          if (_.get(chunk, 'model')) {
            model = chunk.model;
          }

          if (_.get(chunk, 'usage')) {
            usage = chunk.usage;
          }

          const chunkFinishReason = _.get(chunk, 'choices[0].finish_reason');
          if (chunkFinishReason) {
            finishReason = chunkFinishReason;
          }

          const delta = _.get(chunk, 'choices[0].delta.content', '');
          if (delta) {
            accumulatedContent += delta;
            if (typeof handlers.onDelta === 'function') {
              try {
                handlers.onDelta(delta, {
                  accumulatedContent,
                  accumulatedLength: accumulatedContent.length,
                  chunk,
                });
              } catch (handlerErr) {
                rejectOnce(handlerErr);
                return;
              }
            }
          }
        }

        if (controller.signal.aborted) {
          const abortErr = new Error('USER_STOPPED');
          abortErr.name = 'AbortError';
          abortErr.code = 'USER_STOPPED';
          rejectOnce(abortErr);
          return;
        }

        resolveOnce({
          content: accumulatedContent,
          usage,
          finishReason,
          model,
          raw: {
            stream: true,
            done: true,
            chunkCount,
          },
        });
      } catch (streamErr) {
        if (controller.signal.aborted) {
          const abortErr = new Error('USER_STOPPED');
          abortErr.name = 'AbortError';
          abortErr.code = 'USER_STOPPED';
          rejectOnce(abortErr);
        } else {
          rejectOnce(streamErr);
        }
      }
    })
    .catch(err => {
      if (controller.signal.aborted) {
        const abortErr = new Error('USER_STOPPED');
        abortErr.name = 'AbortError';
        abortErr.code = 'USER_STOPPED';
        rejectOnce(abortErr);
      } else {
        rejectOnce(mapError(err));
      }
    });

  return {
    async abort() {
      if (!settled) {
        controller.abort();
        try {
          await abortStreamInstance();
        } catch (err) {
          // ignore abort cleanup errors
        }
      }
    },
    result,
  };
}

module.exports = {
  createOpenAIClient,
  invokeNonStream,
  invokeStream,
  normalizeBaseUrl,
  extractContent,
};
