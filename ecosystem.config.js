/** ecosystem.config.js */
module.exports = {
  apps: [
    {
      name: "nso.mn",
      // PM2 deploy үүсгэх "current" symlink руу ажиллуулна
      cwd: "/home/nso/nso.mn/current",

      // Next.js production server-г npm-ээр асаана
      script: "npm",
      args: "start",

      // Prod тохиргоонууд
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },

      // Тогтвортой ажиллагаа
      exec_mode: "cluster",
      instances: 2,                 // CPU-гийн тоонд тааруулж болно
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",   // 512Мб давбал дахин асаана

      // Лог
      out_file: "/home/nso/.pm2/logs/nso.mn-out.log",
      error_file: "/home/nso/.pm2/logs/nso.mn-error.log",
      log_date_format: "YYYY-MM-DD HH:mm Z",
    },
  ],

  deploy: {
    production: {
      user: "nso",
      host: ["183.81.170.9"],
      ref: "origin/main",
      repo: "https://github.com/tsedenbaljir/nso-nextjs.git",
      // PM2 энэ замд releases/ болон current/ үүсгэнэ
      path: "/home/nso/nso.mn",
      ssh_options: "StrictHostKeyChecking=no",
      shallow: true,

      // Build toolchain-аа идэвхжүүлээд (nvm/corepack гэх мэт) CI суулгалт → build → dev deps prune → reload
      "post-deploy":
        'npm ci; ' +                         // reproducible install
        'npm run build; ' +                  // Next.js build
        'npm prune --omit=dev; ' +           // production-д dev deps цэгцэлнэ
        'pm2 startOrReload ecosystem.config.js --env production',
    },
  },
};
