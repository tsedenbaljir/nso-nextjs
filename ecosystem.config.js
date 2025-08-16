module.exports = {
  apps: [
    {
      name: "nso-new.mn",
      cwd: "/home/nso/nso-new.mn/current",
      script: "node",
      args: ".next/standalone/server.js",
      env: { NODE_ENV: "production", HOSTNAME: "0.0.0.0", PORT: "3000" },
      watch: false
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
      "post-deploy": [
        "cd /home/nso/nso-new.mn/current",
        "npm ci",
        "npm run build",
        "mkdir -p /home/nso/nso-new.mn/shared/uploads",
        "ln -sfn /home/nso/nso-new.mn/shared/uploads public/uploads",
        "pm2 startOrReload ecosystem.config.js --only nso-new.mn"
      ].join(" && "),
      shallow: true
    }
  }
};
