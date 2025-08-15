module.exports = {
  apps: [
    {
      name: "nso-new.mn",
      cwd: "/home/nso/nso-new.mn/current",
      script: "node",
      args: ".next/standalone/server.js",
      interpreter: "none",
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
      path: "/home/nso/nso-new.mn",
      "post-deploy": "npm install --force && npm run build && pm2 reload ecosystem.config.js --env production",
      shallow: true
    },
  },
};
