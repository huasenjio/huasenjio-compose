const _ = require('lodash');
const { createOpenAIClient, invokeNonStream, invokeStream } = require('./openai-sdk.js');

function parseJSON(text, def) {
  if (!text) return def;
  try {
    return JSON.parse(text);
  } catch (err) {
    return def;
  }
}

async function invokeCompatibleProvider(provider, payload) {
  const extraConfig = parseJSON(provider.extraConfig, {});
  const client = createOpenAIClient(provider, extraConfig);
  return invokeNonStream(client, payload);
}

function invokeCompatibleProviderStream(provider, payload, handlers) {
  const extraConfig = parseJSON(provider.extraConfig, {});
  const client = createOpenAIClient(provider, extraConfig);
  return invokeStream(client, payload, handlers);
}

module.exports = {
  invokeCompatibleProvider,
  invokeCompatibleProviderStream,
};
