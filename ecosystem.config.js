module.exports = {
  apps: [{
    name: 'wa-bot',
    script: 'dist/index.js',
    cwd: './',

    // === Runtime ===
    instances: 1,
    exec_mode: 'fork',         // safest for a single persistent bot
    interpreter: 'node',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',

    // === Restart policy ===
    min_uptime: '10s',         // must stay up at least 10s to be considered "stable"
    max_restarts: 10,          // avoid infinite crash loops
    restart_delay: 5000,       // wait 5s between restarts
    exp_backoff_restart_delay: 10000, // exponential backoff if it keeps crashing

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
