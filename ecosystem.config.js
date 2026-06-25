module.exports = {
  apps: [
    {
      name: "nso.mn",
      script: "npm",
      args: "run start",
      exec_mode: "cluster",
      instances: "max", // бүх CPU core ашиглана
      watch: false,      // production дээр watch унтраа
      max_memory_restart: "1G",
    },
  ],

  deploy: {
    production: {
      user: "nso",
      host: "103.85.185.46",
      ref: "origin/main",
      repo: "https://github.com/tsedenbaljir/nso-nextjs.git",
      path: "/home/nso/nso.mn",
      "post-deploy":
        "npm install --legacy-peer-deps && npm run build && pm2 reload ecosystem.config.js --env production",
      shallow: true,
    },
  },
};