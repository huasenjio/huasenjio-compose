const pm2 = require('pm2');

// 连接到 PM2
pm2.connect(function (err) {
  if (err) {
    console.error("pm2连接失败：", err);
    process.exit(2);
  }
  // 重启指定的进程
  pm2.restart('app', function (err, proc) {
    if (err) {
      console.error('无法重启 app 服务：', err);
      pm2.disconnect(); // 断开连接
      return;
    }
    console.log('app 服务已重启');
    pm2.disconnect(); // 断开连接
  });
});