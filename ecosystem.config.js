module.exports = {
    apps: [{
        name: 'wa-bot',
        script: 'dist/index.js',
        cwd: './',
        instances: 1,
        autorestart: true,
        restart_delay: 5000,
        max_restarts: 10,
        min_uptime: '10s',
        watch: false,
        max_memory_restart: '1G',
        env: {
            NODE_ENV: 'production'
        },
        error_file: './logs/err.log',
        out_file: './logs/out.log',
        log_file: './logs/combined.log',
        time: true
    }]
};
