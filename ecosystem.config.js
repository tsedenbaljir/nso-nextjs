module.exports = {
  apps: [
    {
      name: "nso-new.mn",
      cwd: "/home/nso/nso-new.mn/current", // Бүх файлуудын зөв зам
      script: "npm",  // npm-ийг ашиглах
      args: "run start",  // командын аргумент
      interpreter: "none", // Node.js ашиглана
      watch: true
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
