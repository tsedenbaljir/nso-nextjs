/**
 * Seed commodity_cpi / commodity_ppi from cpi-vs-ppi.json
 *   node scripts/seed-cpi-ppi.mjs
 */
import knex from "knex";
import fs from "fs";
import path from "path";

try {
  const envPath = path.join(process.cwd(), ".env");
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m || process.env[m[1]] != null) continue;
    let v = m[2].trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    process.env[m[1]] = v;
  }
} catch {
  /* no .env */
}

const PRODUCT_TABLE = "[dbo].[cpi_ppi_product]";
const CPI_TABLE = "[dbo].[commodity_cpi]";
const PPI_TABLE = "[dbo].[commodity_ppi]";

const db = knex({
  client: "mssql",
  connection: {
    server: process.env.MSSQL_SERVER || process.env.DB_SERVER || "nso.mn",
    port: 1433,
    user: process.env.NSOWEB_USER || "user1212",
    password: process.env.NSOWEB_PASSWORD || "wZGAKCXpZUEB",
    database: process.env.NSOWEB_DATABASE || "NSOweb",
    options: {
      encrypt: true,
      trustServerCertificate: true,
      connectTimeout: 20000,
      requestTimeout: 180000,
      enableArithAbort: true,
    },
  },
});

async function ensure() {
  await db.raw(`
    IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'cpi_ppi_product')
    BEGIN
      CREATE TABLE ${PRODUCT_TABLE} (
        [id] NVARCHAR(64) NOT NULL,
        [name] NVARCHAR(255) NOT NULL,
        [short] NVARCHAR(128) NULL,
        [unit] NVARCHAR(32) NULL,
        [category] NVARCHAR(64) NULL,
        [sort_order] INT NOT NULL CONSTRAINT DF_cpi_ppi_product_sort DEFAULT (0),
        CONSTRAINT PK_cpi_ppi_product PRIMARY KEY ([id])
      );
    END
  `);
  await db.raw(`
    IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'commodity_cpi')
    BEGIN
      CREATE TABLE ${CPI_TABLE} (
        [month] CHAR(7) NOT NULL,
        [product_id] NVARCHAR(64) NOT NULL,
        [value] FLOAT NOT NULL,
        [updated_at] DATETIME2 NOT NULL CONSTRAINT DF_commodity_cpi_updated DEFAULT (SYSUTCDATETIME()),
        [updated_by] NVARCHAR(100) NULL,
        CONSTRAINT PK_commodity_cpi PRIMARY KEY ([month], [product_id])
      );
    END
  `);
  await db.raw(`
    IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'commodity_ppi')
    BEGIN
      CREATE TABLE ${PPI_TABLE} (
        [month] CHAR(7) NOT NULL,
        [product_id] NVARCHAR(64) NOT NULL,
        [value] FLOAT NOT NULL,
        [updated_at] DATETIME2 NOT NULL CONSTRAINT DF_commodity_ppi_updated DEFAULT (SYSUTCDATETIME()),
        [updated_by] NVARCHAR(100) NULL,
        CONSTRAINT PK_commodity_ppi PRIMARY KEY ([month], [product_id])
      );
    END
  `);
}

async function main() {
  await ensure();
  const data = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), "lib/commodity-price-dashboard/cpi-vs-ppi.json"),
      "utf8",
    ),
  );

  await db.raw(`DELETE FROM ${CPI_TABLE}`);
  await db.raw(`DELETE FROM ${PPI_TABLE}`);
  await db.raw(`DELETE FROM ${PRODUCT_TABLE}`);

  let order = 0;
  for (const p of data.products || []) {
    await db.raw(
      `INSERT INTO ${PRODUCT_TABLE} (id, name, short, unit, category, sort_order) VALUES (?,?,?,?,?,?)`,
      [p.id, p.name, p.short || p.name, p.unit || null, p.category || null, order++],
    );
  }

  const months = data.months || [];
  const cpiBatch = [];
  const ppiBatch = [];
  for (const p of data.products || []) {
    for (let i = 0; i < months.length; i += 1) {
      const mo = months[i];
      if (p.cpi?.[i] != null) cpiBatch.push([mo, p.id, Number(p.cpi[i]), "seed"]);
      if (p.ppi?.[i] != null) ppiBatch.push([mo, p.id, Number(p.ppi[i]), "seed"]);
    }
  }

  async function insert(table, rows) {
    const chunk = 50;
    for (let i = 0; i < rows.length; i += chunk) {
      const slice = rows.slice(i, i + chunk);
      await db.raw(
        `INSERT INTO ${table} (month, product_id, value, updated_by) VALUES ${slice
          .map(() => "(?,?,?,?)")
          .join(",")}`,
        slice.flat(),
      );
    }
  }

  await insert(CPI_TABLE, cpiBatch);
  await insert(PPI_TABLE, ppiBatch);
  console.log(
    `OK products=${data.products.length} months=${months.length} cpi=${cpiBatch.length} ppi=${ppiBatch.length}`,
  );
  await db.destroy();
}

main().catch(async (e) => {
  console.error(e);
  try {
    await db.destroy();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
