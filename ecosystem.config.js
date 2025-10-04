module.exports = {
    apps: [{
        name: 'wa-bot',
        script: 'dist/index.js',
        cwd: './',
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        env: {
            NODE_ENV: 'development'
        },
        env_production: {
            NODE_ENV: 'production'
        }
    }, {
        name: 'wa-bot-dev',
        script: 'src/index.ts',
        interpreter: 'node',
        interpreter_args: '--loader ts-node/esm',
        cwd: './',
        instances: 1,
        autorestart: true,
        watch: ['src'],
        ignore_watch: ['node_modules', 'data', '.wwebjs_auth', '.wwebjs_cache'],
        max_memory_restart: '1G',
        env: {
            NODE_ENV: 'development'
        }
    }]
};
