module.exports = {
  apps: [
    {
      name: "nso.mn",
      script: "npm run start",
      watch: true,
      env: {
        NODE_ENV: "production",
        UPLOAD_PATH: "/home/nso/uploads"
      }
    },
  ],
  deploy: {
    production: {
      user: "nso",
      host: "183.81.170.9",
      ref: "origin/main",
      repo: "https://github.com/tsedenbaljir/nso-nextjs.git",
      path: "/home/nso/nso.mn",
      "post-deploy":
        "npm install --force && npm run build && pm2 reload ecosystem.config.js --env production",
      shallow: true
    },
  },
};
