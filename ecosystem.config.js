module.exports = {
  apps: [
    {
      name: "nso.mn",
      cwd: "/home/nso/nso.mn/current",                 // PM2 current release-ээс ажиллуулна
      script: "./node_modules/next/dist/bin/next",     // Next binary-г шууд ажиллуулна
      interpreter: "node",                              // ← чухал: bash биш, node-оор
      args: "start -p 3000",                            // таны backend порт
      exec_mode: "cluster",
      instances: 2,                                     // zero-downtime reload
      watch: false,
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: "3000"
        // UPLOAD_PATH хэрэггүй бол орхи; хэрэгтэй бол энд нэм
        // UPLOAD_PATH: "/home/nso/uploads"
      },
      error_file: "/home/nso/logs/nso.err.log",
      out_file: "/home/nso/logs/nso.out.log",
      merge_logs: true
    },
  ],

  deploy: {
    production: {
      user: "nso",
      host: "183.81.170.9",
      ref: "origin/main",
      repo: "https://github.com/tsedenbaljir/nso-nextjs.git",
      path: "/home/nso/nso.mn",
      // Tailwind/PostCSS зэрэг devDeps build-д хэрэгтэй → ci, build,
      // дараа нь devDeps-ийг цэвэрлээд (prune) zero-downtime reload хийнэ
      "post-deploy":
        "mkdir -p /home/nso/logs && npm ci && npm run build && npm prune --omit=dev && pm2 startOrReload ecosystem.config.js --only nso.mn --env production",
      shallow: true
    },
  },
};
