const knex = require("knex");

/**
 * Next.js (esp. dev HMR) can re-import this module many times.
 * Reusing the same knex instances avoids leaking pools until "pool is full".
 */
const globalKey = "__nso_knex_pools_v1";

function createMssqlKnex({ server, database, user, password, poolMax = 8 }) {
  return knex({
    client: "mssql",
    connection: {
      server,
      port: 1433,
      user,
      password,
      database,
      options: {
        encrypt: true,
        trustServerCertificate: true,
        connectTimeout: 15000,
        requestTimeout: 30000,
        enableArithAbort: true,
      },
    },
    pool: {
      // min 0: don't hold idle sockets open (bad for multi-IP / flaky DNS)
      min: 0,
      max: poolMax,
      acquireTimeoutMillis: 20000,
      idleTimeoutMillis: 10000,
      createTimeoutMillis: 15000,
      destroyTimeoutMillis: 5000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 200,
      // don't leave a dead "pending create" forever soaking the pool
      propagateCreateError: true,
    },
    // spamms console + holds query work longer during debug
    debug: false,
  });
}

function getPools() {
  if (global[globalKey]?.db) {
    return global[globalKey];
  }

  // Prefer MSSQL_SERVER when set (e.g. 103.85.185.46). nso.mn can resolve to
  // private LAN IPs that hang outside the office network and exhaust the pool.
  const nsoServer = process.env.MSSQL_SERVER || process.env.DB_SERVER || "nso.mn";
  const homoServer =
    process.env.HOMO_MSSQL_SERVER || process.env.XAOMC_SERVER || "103.85.185.42";

  const db = createMssqlKnex({
    server: nsoServer,
    database: process.env.NSOWEB_DATABASE || "NSOweb",
    user: process.env.NSOWEB_USER || "user1212",
    password: process.env.NSOWEB_PASSWORD || "wZGAKCXpZUEB",
    poolMax: 8,
  });

  const data1212 = createMssqlKnex({
    server: nsoServer,
    database: process.env.DATA1212_DATABASE || "Data1212",
    user: process.env.NSOWEB_USER || "user1212",
    password: process.env.NSOWEB_PASSWORD || "wZGAKCXpZUEB",
    poolMax: 6,
  });

  const homoStatistic = createMssqlKnex({
    server: homoServer,
    database: process.env.HOMO_DATABASE || "XAOMCDB-NSO",
    user: process.env.HOMO_USER || "1212",
    password: process.env.HOMO_PASSWORD || "6sW>'tXJS)31",
    poolMax: 6,
  });

  const closeConnections = async () => {
    try {
      await Promise.all([
        db.destroy(),
        data1212.destroy(),
        homoStatistic.destroy(),
      ]);
      delete global[globalKey];
      console.log("Database connections closed gracefully");
    } catch (error) {
      console.error("Error closing database connections:", error);
    }
  };

  if (typeof process !== "undefined" && !global.__nso_knex_shutdown_hooks) {
    global.__nso_knex_shutdown_hooks = true;
    process.on("SIGINT", closeConnections);
    process.on("SIGTERM", closeConnections);
  }

  const pools = { db, data1212, homoStatistic, closeConnections };
  global[globalKey] = pools;
  return pools;
}

const { db, data1212, homoStatistic, closeConnections } = getPools();

module.exports = { db, data1212, homoStatistic, closeConnections };
