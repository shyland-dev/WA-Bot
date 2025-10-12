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
    min_uptime: '10s',           // must survive 10s to be considered stable
    max_restarts: 20,            // prevent infinite restart loops
    restart_delay: 5000,         // wait 5s between restarts
    exp_backoff_restart_delay: 10000, // exponential backoff for repeated crashes
    max_memory_restart: '700M',  // restart if memory exceeds this limit

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

    // === STARTUP RELIABILITY ===
    // If the bot exits with code 0, PM2 will still keep it alive
    stop_exit_codes: [0],
  }]
};
