module.exports = {
  apps: [{
    name: 'wa-bot',
    script: 'dist/index.js',
    cwd: './',

    // === Runtime ===
    instances: 1,
    exec_mode: 'fork',         // safest for a single persistent bot
    autorestart: true,

    // === Environment ===
    env: {
      NODE_ENV: 'production'
    },

    // === Logging ===
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_file: './logs/combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};
