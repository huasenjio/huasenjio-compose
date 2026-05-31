export function getServerApi(api, options = {}) {
  const devPrefix = options.devPrefix || '/dev';
  const prodPrefix = options.prodPrefix || '/api';
  return process.env.NODE_ENV === 'development' ? `${devPrefix}${api}` : `${prodPrefix}${api}`;
}
