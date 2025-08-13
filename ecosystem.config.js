/** ecosystem.config.js */
module.exports = {
  apps: [
    {
      name: "nso.mn",

      // PM2 deploy-аар үүсэх "current" symlink-ээс ажиллуулна
      cwd: "/home/nso/nso.mn/current",

      // Next.js production server-ийг npm script-ээр асаана
      script: "npm",
      args: "start",

      // Орчны хувьсагчид
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },

      // Тогтвортой ажиллагаа
      exec_mode: "cluster",
      instances: "max",            // CPU цөмүүдээр автоматаар
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",    // 1ГБ давбал дахин асаана
    },
  ],

  deploy: {
    production: {
      user: "nso",
      host: ["183.81.170.9"],
      ref: "origin/main",
      repo: "https://github.com/tsedenbaljir/nso-nextjs.git",

      // PM2 энэ замд releases/ ба current/ үүсгэнэ
      path: "/home/nso/nso.mn",

      ssh_options: "StrictHostKeyChecking=no",
      shallow: true,

      // Build toolchain → install → build → prod deps үлдээгээд → reload
      "post-deploy": [
        "npm ci",
        "npm run build",
        "npm prune --omit=dev",
        // PM2 өөрөө current symlink-ийг шинэ release рүү зааж өгдөг тул
        // тусдаа ln -sf хийх шаардлагагүй.
        "pm2 startOrReload ecosystem.config.js --env production"
      ].join(" && "),
    },
  },
};
