/**
 * PM2 Ecosystem Configuration File
 *
 * This file configures PM2 process manager for the Intent Identifier server.
 *
 * Usage:
 *   pm2 start ecosystem.config.js
 *   pm2 save
 *   pm2 startup
 */

module.exports = {
  apps: [{
    // Application name
    name: 'intent-identifier',

    // Script to run
    script: './Frontend/server.js',

    // Arguments (if needed)
    args: '',

    // Number of instances
    // 1 = single instance
    // 'max' = use all CPU cores
    instances: 1,

    // Execution mode
    // 'cluster' for multiple instances
    // 'fork' for single instance
    exec_mode: 'fork',

    // Auto restart on crash
    autorestart: true,

    // Watch for file changes and auto-restart (disable in production)
    watch: false,

    // Ignore these directories when watching
    ignore_watch: [
      'node_modules',
      'logs',
      '.git',
      'Working',
      'Unit Tests'
    ],

    // Max memory before restart (prevents memory leaks)
    max_memory_restart: '1G',

    // Environment variables for production
    env: {
      NODE_ENV: 'production',
      PORT: 8888,
      // Add other environment variables here
    },

    // Environment variables for development (use with: pm2 start --env development)
    env_development: {
      NODE_ENV: 'development',
      PORT: 8888,
    },

    // Log configuration
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',

    // Add timestamp to logs
    time: true,

    // Merge logs from all instances
    merge_logs: true,

    // Minimum uptime before considering app stable (in ms)
    min_uptime: '10s',

    // Max number of restart attempts before giving up
    max_restarts: 10,

    // Delay between restarts (in ms)
    restart_delay: 4000,

    // Exponential backoff restart delay
    exp_backoff_restart_delay: 100,

    // Auto restart on specific exit codes
    autorestart: true,

    // Cron pattern for automatic restart (optional)
    // Example: restart every day at 2am
    // cron_restart: '0 2 * * *',

    // Interpret cron in this timezone
    // time_zone: 'America/Los_Angeles',
  }]
};
