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
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 60000,
    idleTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 200,
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
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 60000,
    idleTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 200,
  },
  debug: true,
});

const homoStatistic = knex({
  client: "mssql",
  connection: {
    server: "103.85.185.42",
    port: 1433,
    user: "1212",
    password: "6sW>'tXJS)31",
    database: "XAOMCDB",
    options: {
      encrypt: true,
      trustServerCertificate: true,
      connectTimeout: 40000,
    },
  },
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 60000,
    idleTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 200,
  },
  debug: true,
});

// Graceful shutdown handler
const closeConnections = async () => {
  try {
    await Promise.all([
      db.destroy(),
      data1212.destroy(),
      homoStatistic.destroy(),
    ]);
    console.log("Database connections closed gracefully");
  } catch (error) {
    console.error("Error closing database connections:", error);
  }
};

// Handle process termination
if (typeof process !== "undefined") {
  process.on("SIGINT", closeConnections);
  process.on("SIGTERM", closeConnections);
}

module.exports = { db, data1212, homoStatistic, closeConnections };
