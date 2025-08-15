module.exports = {
  apps: [
    {
      name: "nso.mn",
      script: "npm run start",
      watch: [
        "public"
      ],
      ignore_watch: [
        "node_modules",
        ".git",
        "app",
        "components",
        "utils",
        "logs"
      ],
      autorestart: true,
      max_memory_restart: "1G",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000
      }
    },
  ],
  deploy: {
    production: {
      user: "nso",
      host: "183.81.170.9",
      ssh_options: "StrictHostKeyChecking=no",
      ref: "origin/main",
      repo: "git@github.com:tsedenbaljir/nso-nextjs.git",
      path: "/home/nso/nso.mn",
      "pre-deploy-local": "echo 'Deploying to production...'",
      "post-deploy": "cd /home/nso/nso.mn/current && npm install --force && npm run build && pm2 reload ecosystem.config.js --env production",
      "pre-setup": "echo 'Setting up deployment...'",
      shallow: true
    },
  },
};
