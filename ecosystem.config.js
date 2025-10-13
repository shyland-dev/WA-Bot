module.exports = {
  apps: [{
    // === BASIC INFO ===
    name: 'wa-bot',
    script: 'dist/index.js',
    cwd: './',                   // make sure paths are relative to project root
    exec_mode: 'fork',           // single persistent instance (best for bots)
    instances: 1,                // never cluster a WhatsApp session
    interpreter: 'node',

    // === RESTART & STABILITY ===
    autorestart: true,           // restart on crash or exit
    watch: false,                // disable watch to prevent loops

    // === ENVIRONMENT ===
    env: {
      NODE_ENV: 'production',
      TZ: 'America/Sao_Paulo'    // adjust timezone as you prefer
    },

    // === LOGGING ===
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_file: './logs/combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    combine_logs: true,
  }]
};
