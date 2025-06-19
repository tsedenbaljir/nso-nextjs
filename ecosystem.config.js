module.exports = {
  apps: [
    {
      name: "beta.nso.mn",
      script: "npm",
      args: "start",
      cwd: "/home/nso/nso-nextjs",
      env: {
        NODE_ENV: "production"
      },
      watch: false
    },
  ],
  deploy: {
    production: {
      user: "nso",
      host: "183.81.170.9",
      ref: "origin/main",
      repo: "https://github.com/tsedenbaljir/nso-nextjs.git",
      path: "/home/nso/nso-nextjs",
      "post-deploy":
        "npm install --force && npm run build && pm2 reload ecosystem.config.js --env production",
    },
  },
};
