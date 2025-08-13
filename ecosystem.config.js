/** ecosystem.config.js */
module.exports = {
  apps: [
    {
      name: "nso.mn",
      cwd: "/home/nso/nso.mn/current",

      // Next.js production server-г шууд ажиллуулна
      script: "./node_modules/next/dist/bin/next",
      args: "start -p 3000",

      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },

      // Тогтвортой: ганц процесс, fork mode
      exec_mode: "fork",
      instances: 1,
      watch: false,
      autorestart: true,
      max_memory_restart: "512M",

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
      path: "/home/nso/nso.mn",
      ssh_options: "StrictHostKeyChecking=no",
      shallow: true,
      "post-deploy":
        'set -e; ' +
        'npm ci; ' +                 // цэвэр install
        'npm run build; ' +          // Next build
        'npm prune --omit=dev; ' +   // prod-д dev deps хасна
        'pm2 startOrReload ecosystem.config.js --env production',
    },
  },
};
