module.exports = {
  apps: [{
    // === BASIC INFO ===
    name: 'wa-bot',
    script: 'dist/index.js',
    cwd: './',
    exec_mode: 'fork',
    instances: 1,
    interpreter: 'node',

    // === RESTART & STABILITY ===
    autorestart: true,
    watch: false,
    restart_delay: 10000,        // Wait 10 seconds before restart
    max_restarts: 5,             // Max 5 restarts in 1 minute
    min_uptime: '30s',           // Must stay up for 30s to be considered stable

    // === ENVIRONMENT ===
    env: {
      NODE_ENV: 'production',
      TZ: 'America/Sao_Paulo'
    },

    // === LOGGING ===
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_file: './logs/combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    combine_logs: true,

    // === ERROR HANDLING ===
    kill_timeout: 5000,          // Time to wait before force killing
    listen_timeout: 8000,        // Time to wait for app to start
    shutdown_with_message: true
  }]
};
