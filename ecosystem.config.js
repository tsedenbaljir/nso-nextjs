module.exports = {
  apps: [
    {
      name: "nso-new.mn",
      cwd: "/home/nso/nso-new.mn/current",
      script: "npm run start",
      watch: false,
      env: {
        NODE_ENV: "production"
      }
    }
  ],

  deploy: {
    production: {
      user: "nso",
      host: "183.81.170.9",
      ref: "origin/main",
      repo: "git@github.com:tsedenbaljir/nso-nextjs.git",
      path: "/home/nso/nso-new.mn",
      ssh_options: "StrictHostKeyChecking=no",
      "pre-deploy-local": "",
      "post-deploy":
        "npm install --force && npm run build && pm2 reload ecosystem.config.js --env production",
      shallow: true
    }
  }
};
