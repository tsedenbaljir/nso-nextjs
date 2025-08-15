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
      "post-deploy": "npm install --force && npm run build && pm2 reload ecosystem.config.js --env production",
      shallow: true
    },
  },
};
