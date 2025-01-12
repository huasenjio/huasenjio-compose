module.exports = {
  apps: [
    {
      name: 'app',
      script: 'app.js',
      watch: true,
      ignore_watch: ['log/error.log', 'log/warn.log'],
      args: 'MODE=pro'
    }
  ]
};