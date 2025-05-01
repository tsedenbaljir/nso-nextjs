const knex = require("knex");

const db = knex({
  client: "mssql",
  connection: {
    host: "183.81.170.9",
    port: 1433,
    user: "sa",
    password: "user1212",
    database: "wZGAKCXpZUEB",
  },
  options: {
    connectTimeout: 40000,
    encrypt: false,
    trustServerCertificate: false,
  },
  debug: true,
});

module.exports = { db };
