module.exports = {
  apps: [
    {
      name: "nso.mn",
      script: "npm",
      args: "start",
      instances: 1,
      watch: true,
      time: true,
      kill_timeout: 5000,
      listen_timeout: 8000,
      min_uptime: "10s",
      max_restarts: 10,
      restart_delay: 4000,
    },
  ],
  deploy: {
    production: {
      user: "nso",
      host: "183.81.170.9",
      ref: "origin/main",
      repo: "https://github.com/tsedenbaljir/nso-nextjs.git",
      path: "/home/nso/nso.mn",
      "post-deploy": "npm install --force && npm run build && pm2 reload ecosystem.config.js --env production",
    },
  },
};
