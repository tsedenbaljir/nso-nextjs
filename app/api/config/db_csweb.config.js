const knex = require("knex");

const db = knex({
  client: "mssql",
  connection: {
    host: "10.0.0.160",
    port: 1433,
    user: "sa",
    password: "M@ldata0o",
    database: "NSOweb",
  },
  options: {
    connectTimeout: 40000,
    encrypt: false,
    trustServerCertificate: false,
  },
  debug: true,
});

module.exports = { db };
