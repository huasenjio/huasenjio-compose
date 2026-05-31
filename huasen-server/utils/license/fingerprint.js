const { createHash } = require('crypto');
const { execFileSync, execSync } = require('child_process');

let instanceFingerprint = '';

function normalizeHostId(hostId) {
  return String(hostId || '').trim();
}

function readDockerSocketHostId() {
  const socketPath = process.env.DOCKER_SOCKET_PATH || '/var/run/docker.sock';
  const script = `
const http = require('http');
const req = http.request({ socketPath: ${JSON.stringify(socketPath)}, path: '/info', method: 'GET', timeout: 3000 }, res => {
  let body = '';
  res.setEncoding('utf8');
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      const info = JSON.parse(body || '{}');
      if (!info.ID) process.exit(2);
      process.stdout.write(info.ID);
    } catch (e) {
      process.exit(3);
    }
  });
});
req.on('timeout', () => req.destroy(new Error('Docker Socket 请求超时')));
req.on('error', () => process.exit(4));
req.end();
`;

  return normalizeHostId(
    execFileSync(process.execPath, ['-e', script], {
      encoding: 'utf8',
      timeout: 5000,
      stdio: ['ignore', 'pipe', 'ignore'],
    }),
  );
}

function readDockerHostId() {
  return normalizeHostId(
    execSync('docker info --format "{{.ID}}"', {
      encoding: 'utf8',
      timeout: 1000 * 5,
      stdio: ['ignore', 'pipe', 'ignore'],
    }),
  );
}

function readHostId() {
  const readers = [
    { name: 'Docker Socket', read: readDockerSocketHostId },
    { name: 'Docker CLI', read: readDockerHostId },
  ];
  const errors = [];

  for (const reader of readers) {
    try {
      const hostId = reader.read();
      if (hostId) return hostId;
    } catch (err) {
      errors.push(reader.name);
    }
  }

  throw new Error(`实例 ID 不可用，已尝试：${errors.join('、') || '未读取到有效实例 ID'}`);
}

function generateInstanceFingerprint() {
  if (instanceFingerprint) return instanceFingerprint;

  const hostId = readHostId();
  if (!hostId) throw new Error('实例 ID 为空');

  instanceFingerprint = createHash('sha256').update(hostId).digest('hex').slice(0, 16);
  console.log(`[Huasen Log]：实例指纹 ${instanceFingerprint}`);
  return instanceFingerprint;
}

module.exports = { generateInstanceFingerprint };
