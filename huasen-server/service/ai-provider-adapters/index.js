const qwen = require('./qwen.js');
const deepseek = require('./deepseek.js');
const kimi = require('./kimi.js');
const siliconflow = require('./siliconflow.js');
const camel = require('./camel.js');
const custom = require('./custom.js');

const adapterMap = {
  qwen,
  deepseek,
  kimi,
  siliconflow,
  camel,
  custom,
};

async function invokeProvider(provider, payload) {
  const adapter = adapterMap[provider.providerType];
  if (!adapter || typeof adapter.invoke !== 'function') {
    throw new Error(`暂不支持 ${provider.providerType} 供应商`);
  }
  return adapter.invoke(provider, payload);
}

function invokeProviderStream(provider, payload, handlers = {}) {
  const adapter = adapterMap[provider.providerType];
  if (!adapter || typeof adapter.invokeStream !== 'function') {
    throw new Error(`暂不支持 ${provider.providerType} 供应商流式输出`);
  }
  return adapter.invokeStream(provider, payload, handlers);
}

module.exports = {
  invokeProvider,
  invokeProviderStream,
};
