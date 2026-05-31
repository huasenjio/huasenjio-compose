const { invokeCompatibleProvider, invokeCompatibleProviderStream } = require('./common.js');

async function invoke(provider, payload) {
  return invokeCompatibleProvider(provider, payload);
}

function invokeStream(provider, payload, handlers) {
  return invokeCompatibleProviderStream(provider, payload, handlers);
}

module.exports = {
  invoke,
  invokeStream,
};
