import knex from 'knex';

const db = knex({
  client: 'mssql',
  connection: {
    server: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    options: {
      encrypt: true,
      trustServerCertificate: true
    },
    pool: {
      min: 0,
      max: 10
    }
  }
});

export default db; 