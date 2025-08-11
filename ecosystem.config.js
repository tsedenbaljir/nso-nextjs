module.exports = {
  apps: [
    {
      name: "nso.mn",
      script: "npm run start",
      watch: false,
      env: {
        NODE_ENV: "production",
        UPLOAD_PATH: "/home/nso/uploads"
      }
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
        "npm install --force && npm run build && pm2 reload ecosystem.config.js --env production",
      shallow: true
    },
  },
};
// module.exports = {
//   apps: [
//     {
//       name: "nso.mn",
//       script: "npm",
//       args: "run start", // start скриптээ зөв ажиллуулах
//       exec_mode: "cluster", // ZERO-downtime байлгахын тулд cluster mode ашиглана
//       instances: 2, // 2 instances хэрэгтэй (эсвэл "max")
//       watch: false, // production-д watch хэрэггүй
//       autorestart: true, // апп унасан тохиолдолд дахин эхлэнэ
//       max_memory_restart: "512M", // санах ойг хэтрүүлэхгүй байх
//       env: {
//         NODE_ENV: "production",
//         UPLOAD_PATH: "/home/nso/uploads",
//       }
//     },
//   ],
//   deploy: {
//     production: {
//       user: "nso",
//       host: "183.81.170.9",
//       ref: "origin/main",
//       repo: "https://github.com/tsedenbaljir/nso-nextjs.git",
//       path: "/home/nso/nso.mn",
//       "post-deploy": "npm ci && npm run build && pm2 reload ecosystem.config.js --env production", // npm install-ийг ci-р сольсон
//       shallow: true
//     },
//   },
// };
