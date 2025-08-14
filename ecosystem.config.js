// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "nso.mn",
      cwd: "/home/nso/nso.mn/current",        // PM2 deploy-ийн "current" symlink-оос ажиллуулна
      script: "npm",
      args: "start",
      exec_mode: "cluster",                   // ← zero‑downtime reload
      instances: 4,                           // эсвэл "max"
      watch: true,                           // prod-д ХААЖ өг
      time: true,

      // Тогтвортой ажиллагаа
      min_uptime: "10s",
      max_restarts: 10,
      restart_delay: 4000,
      autorestart: true,
    },
  ],

  deploy: {
    production: {
      user: "nso",
      host: "183.81.170.9",
      ref: "origin/main",
      repo: "https://github.com/tsedenbaljir/nso-nextjs.git",
      path: "/home/nso/nso.mn",

      // PM2 deploy нь releases/ + current symlink ашиглан "atomic" deploy хийдэг
      // Ингэснээр build хуучин хувилбарыг зогсоохгүй явагдаж, reload үед л солигдоно.
      "post-deploy": [
        "npm install --force",                     // npm install биш: тогтвортой, хурдан
        "npm run build",                      // build шинэхэн release дотор хийгдэнэ
        "pm2 reload ecosystem.config.js --env production" // cluster mode тул zero‑downtime
      ].join(" && "),
    },
  },
};
