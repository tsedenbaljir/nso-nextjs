const knex = require("knex");

const db = knex({
  client: "mssql",
  connection: {
    server: "nso.mn",
    port: 1433,
    user: "user1212",
    password: "wZGAKCXpZUEB",
    database: "NSOweb",
    options: {
      encrypt: true,
      trustServerCertificate: true,
      connectTimeout: 40000,
    },
  },
  debug: true,
});

const data1212 = knex({
  client: "mssql",
  connection: {
    server: "nso.mn",
    port: 1433,
    user: "user1212",
    password: "wZGAKCXpZUEB",
    database: "data1212",
    options: {
      encrypt: true,
      trustServerCertificate: true,
      connectTimeout: 40000,
    },
  },
  debug: true,
});

module.exports = { db, data1212 };
