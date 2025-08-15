module.exports = {
  apps: [
    {
      name: "nso.mn",
      cwd: "/home/nso/nso.mn/current",
      script: "node",
      args: ".next/standalone/server.js",
      interpreter: "none",
      watch: false,
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "0.0.0.0"
      }
    },
  ],
  deploy: {
    production: {
      user: "nso",
      host: "183.81.170.9",
      ssh_options: "ForwardAgent=yes,StrictHostKeyChecking=no",
      ref: "origin/main",
      repo: "git@github.com:tsedenbaljir/nso-nextjs.git",
      path: "/home/nso/nso.mn",
      // Build хийсний дараа standalone-д static + public-ийг хуулна
      "post-deploy": "export NODE_OPTIONS=--max_old_space_size=2048 && npm ci || npm install --force && npm run build && mkdir -p .next/standalone/.next && cp -r .next/static .next/standalone/.next/static && [ -d public ] && cp -r public .next/standalone/public || true && pm2 startOrReload ecosystem.config.js --env production",
      shallow: true
    },
  },
};
