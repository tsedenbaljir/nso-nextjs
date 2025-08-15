module.exports = {
  apps: [
    {
      name: "nso.mn",
      script: "npm run start",
      watch: false
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
