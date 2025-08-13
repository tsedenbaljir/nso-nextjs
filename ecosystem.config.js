module.exports = {
  apps: [
    {
      name: "nso.mn",
      script: "npm run start",
      watch: false,
      env: { NODE_ENV: "production", PORT: 3000 }
    },
  ],
  deploy: {
    production: {
      user: "nso",
      host: "103.85.185.46",
      ref: "origin/main",
      repo: "https://github.com/tsedenbaljir/nso-nextjs.git",
      path: "/home/nso/nso.mn",
      "post-deploy":
        "npm install --force && npm run build && pm2 reload ecosystem.config.js --env production",
      shallow: true
    },
  },
};