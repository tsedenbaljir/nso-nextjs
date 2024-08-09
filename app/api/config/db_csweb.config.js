const knex = require("knex");

const db = knex({
  client: "mysql",
  connection: {
    host: "10.0.1.241",
    user: "csweb2023",
    password: "Nso#2023",
    database: "csweb2023",
  },
  pool: {
    min: 0,
    max: 10,
  },
  acquireConnectionTimeout: 10000, // 10 seconds
});

const users = knex({
  client: "mysql",
  version: "5.2.1",
  connection: {
    host: "10.0.1.242",
    port: 3306,
    user: "csweb2024",
    password: "Nso#2023",
    database: "csweb2024",
  },
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 60000, // 60 seconds
    idleTimeoutMillis: 30000, // 30 seconds
  },
  acquireConnectionTimeout: 60000, // 60 seconds
  debug: true,
});

const bonus = knex({
  client: "mysql",
  version: "5.2.1",
  connection: {
    host: "10.0.1.242",
    port: 3306,
    user: "csweb2024",
    password: "Nso#2023",
    database: "smsdb",
  },
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 60000, // 60 seconds
    idleTimeoutMillis: 30000, // 30 seconds
  },
  acquireConnectionTimeout: 60000, // 60 seconds
  debug: true,
});

const survey = knex({
  client: "mysql",
  version: "5.2.1",
  connection: {
    host: "10.0.1.242",
    port: 3306,
    user: "csweb2024",
    password: "Nso#2023",
    database: "surveysample",
  },
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 60000, // 60 seconds
    idleTimeoutMillis: 30000, // 30 seconds
  },
  acquireConnectionTimeout: 60000, // 60 seconds
  debug: true,
});

module.exports = { db, bonus, survey, users };
