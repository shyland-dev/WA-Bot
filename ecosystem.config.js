module.exports = {
  apps: [{
    name: 'wa-bot',
    script: 'npm',
    args: 'run dev',
    cwd: './',
    instances: 1,
    autorestart: true,
    watch: false, // Let nodemon handle watching
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      script: 'npm',
      args: 'start'
    }
  }]
};
