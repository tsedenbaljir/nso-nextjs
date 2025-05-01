const knex = require("knex");

const db = knex({
  client: "mssql",
  connection: {
    server: "183.81.170.9",
    port: 1433,
    user: "user1212",
    password: "wZGAKCXpZUEB",
    database: "NSOweb",
    options: {
      encrypt: true,                   // try true first (many servers now require encryption)
      trustServerCertificate: true,   // skip cert validation for testing
      connectTimeout: 40000,
    },
  },
  debug: true,
});

module.exports = { db };
