module.exports = {
  apps: [
    {
      name: "nso.mn",
      cwd: "/home/nso/nso.mn/current",
      script: "./node_modules/next/dist/bin/next",
      args: "start -p 3000",
      exec_mode: "cluster",
      instances: 2,
      watch: false,
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
      error_file: "/home/nso/logs/nso.err.log",
      out_file: "/home/nso/logs/nso.out.log",
      merge_logs: true,
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
        "mkdir -p /home/nso/logs && npm ci --omit=dev && npm run build && pm2 startOrReload ecosystem.config.js --only nso.mn --env production",
      shallow: true
    },
  },
};
