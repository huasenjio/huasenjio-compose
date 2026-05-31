const { AUDIT_OPERATE_MAP, ROUTER_PATHS } = require('./access-stat-config.js');

const normalizeUrl = url => {
  let normalizedUrl = String(url || '').split('?')[0].split('#')[0];
  try {
    normalizedUrl = decodeURIComponent(normalizedUrl);
  } catch (err) {}
  normalizedUrl = normalizedUrl.replace(/\/{2,}/g, '/');
  if (normalizedUrl.length > 1) normalizedUrl = normalizedUrl.replace(/\/+$/, '');
  return normalizedUrl;
};

const parseAccessLog = item => {
  if (!item) return null;
  if (typeof item === 'object') return item;
  try {
    return JSON.parse(item);
  } catch (err) {
    return null;
  }
};

const normalizeAccess = access => {
  return Array.isArray(access) ? access : Object.values(access || {});
};

const isKnownRouterUrl = url => {
  return ROUTER_PATHS.some(path => url.includes(path));
};

const collectAccessStat = access => {
  let traces = [];
  let dubious = [];
  let refererSet = new Set();
  let hostSet = new Set();
  let ipMap = {};
  let userPV = 0;
  let managePV = 0;
  let otherPV = 0;

  normalizeAccess(access).forEach(item => {
    let log = parseAccessLog(item);
    if (!log) return;

    let url = normalizeUrl(log.url);

    if (log.dot == 'user') {
      userPV++;
    } else if (log.dot == 'manage') {
      managePV++;
    } else {
      otherPV++;
    }

    ipMap[log.ip] = ipMap[log.ip] ? ipMap[log.ip] + 1 : 1;
    refererSet.add(log.referer);
    hostSet.add(log.host);

    if (!isKnownRouterUrl(url)) dubious.push(log);
    if (AUDIT_OPERATE_MAP[url]) {
      traces.push({
        ...log,
        operateName: AUDIT_OPERATE_MAP[url],
      });
    }
  });

  return {
    userPV,
    managePV,
    otherPV,

    traces,
    dubious,
    referers: Array.from(refererSet),
    hosts: Array.from(hostSet),

    ipMap,
  };
};

module.exports = {
  collectAccessStat,
  isKnownRouterUrl,
  normalizeAccess,
  normalizeUrl,
  parseAccessLog,
};
