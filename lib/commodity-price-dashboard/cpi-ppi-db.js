/**
 * CPI / PPI monthly prices — two fact tables + product catalog.
 *
 * commodity_cpi  — хэрэглээний үнэ (сар × бараа)
 * commodity_ppi  — үйлдвэрлэгчийн үнэ (сар × бараа)
 * cpi_ppi_product — барааны жагсаалт
 */
import fs from "fs/promises";
import path from "path";
import { db } from "@/app/api/config/db_csweb.config.js";

const PRODUCT_TABLE = "[dbo].[cpi_ppi_product]";
const CPI_TABLE = "[dbo].[commodity_cpi]";
const PPI_TABLE = "[dbo].[commodity_ppi]";
const JSON_PATH = "lib/commodity-price-dashboard/cpi-vs-ppi.json";

let ensured = false;

function normalizeRows(result) {
  if (!result) return [];
  if (Array.isArray(result)) {
    if (Array.isArray(result[0])) return result[0];
    return result;
  }
  if (Array.isArray(result.recordset)) return result.recordset;
  if (Array.isArray(result.rows)) return result.rows;
  return [];
}

export async function ensureCpiPpiTables() {
  if (ensured) return;
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
      CREATE INDEX IX_commodity_cpi_month ON ${CPI_TABLE} ([month]);
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
      CREATE INDEX IX_commodity_ppi_month ON ${PPI_TABLE} ([month]);
    END
  `);
  ensured = true;
}

export async function listProducts() {
  await ensureCpiPpiTables();
  return normalizeRows(
    await db.raw(
      `SELECT id, name, short, unit, category, sort_order
       FROM ${PRODUCT_TABLE} ORDER BY sort_order, id`,
    ),
  );
}

export async function listMonths() {
  await ensureCpiPpiTables();
  const rows = normalizeRows(
    await db.raw(`
      SELECT month FROM ${CPI_TABLE}
      UNION
      SELECT month FROM ${PPI_TABLE}
      ORDER BY month
    `),
  );
  return rows.map((r) => String(r.month).trim());
}

/** One month: products with cpi/ppi values (null if missing). */
export async function getMonthSheet(month) {
  await ensureCpiPpiTables();
  const m = String(month).trim();
  const products = await listProducts();
  const cpiRows = normalizeRows(
    await db.raw(`SELECT product_id, value FROM ${CPI_TABLE} WHERE month=?`, [m]),
  );
  const ppiRows = normalizeRows(
    await db.raw(`SELECT product_id, value FROM ${PPI_TABLE} WHERE month=?`, [m]),
  );
  const cpiMap = new Map(cpiRows.map((r) => [r.product_id, Number(r.value)]));
  const ppiMap = new Map(ppiRows.map((r) => [r.product_id, Number(r.value)]));
  return {
    month: m,
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      short: p.short,
      unit: p.unit,
      category: p.category,
      cpi: cpiMap.has(p.id) ? cpiMap.get(p.id) : null,
      ppi: ppiMap.has(p.id) ? ppiMap.get(p.id) : null,
    })),
  };
}

/**
 * Upsert one month for both CPI and PPI.
 * items: [{ product_id, cpi?, ppi? }]
 */
export async function upsertMonth(month, items, updatedBy = "admin") {
  await ensureCpiPpiTables();
  const m = String(month).trim();
  if (!/^\d{4}-\d{2}$/.test(m)) throw new Error("Сар YYYY-MM форматтай байх ёстой");

  const products = await listProducts();
  const known = new Set(products.map((p) => p.id));

  for (const item of items || []) {
    const pid = item.product_id;
    if (!known.has(pid)) continue;

    if (item.cpi != null && !Number.isNaN(Number(item.cpi))) {
      await db.raw(
        `
        MERGE ${CPI_TABLE} AS t
        USING (SELECT ? AS month, ? AS product_id) AS s
          ON t.month = s.month AND t.product_id = s.product_id
        WHEN MATCHED THEN UPDATE SET value=?, updated_at=SYSUTCDATETIME(), updated_by=?
        WHEN NOT MATCHED THEN INSERT (month, product_id, value, updated_by)
          VALUES (?,?,?,?);
        `,
        [m, pid, Number(item.cpi), updatedBy, m, pid, Number(item.cpi), updatedBy],
      );
    }
    if (item.ppi != null && !Number.isNaN(Number(item.ppi))) {
      await db.raw(
        `
        MERGE ${PPI_TABLE} AS t
        USING (SELECT ? AS month, ? AS product_id) AS s
          ON t.month = s.month AND t.product_id = s.product_id
        WHEN MATCHED THEN UPDATE SET value=?, updated_at=SYSUTCDATETIME(), updated_by=?
        WHEN NOT MATCHED THEN INSERT (month, product_id, value, updated_by)
          VALUES (?,?,?,?);
        `,
        [m, pid, Number(item.ppi), updatedBy, m, pid, Number(item.ppi), updatedBy],
      );
    }
  }

  return getMonthSheet(m);
}

/** Full payload matching cpi-vs-ppi.json shape for the public dashboard. */
export async function assembleCpiPpiFile() {
  await ensureCpiPpiTables();
  const products = await listProducts();
  if (!products.length) return null;

  const months = await listMonths();
  if (!months.length) {
    return {
      title: "Хэрэглээний үнэ ба үйлдвэрлэгчийн үнэ, сараар",
      months: [],
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        short: p.short,
        unit: p.unit,
        category: p.category,
        cpi: [],
        ppi: [],
      })),
      updated: null,
    };
  }

  const cpiAll = normalizeRows(
    await db.raw(`SELECT month, product_id, value FROM ${CPI_TABLE}`),
  );
  const ppiAll = normalizeRows(
    await db.raw(`SELECT month, product_id, value FROM ${PPI_TABLE}`),
  );

  const cpiBy = new Map();
  for (const r of cpiAll) {
    const key = `${String(r.month).trim()}|${r.product_id}`;
    cpiBy.set(key, Number(r.value));
  }
  const ppiBy = new Map();
  for (const r of ppiAll) {
    const key = `${String(r.month).trim()}|${r.product_id}`;
    ppiBy.set(key, Number(r.value));
  }

  return {
    title: "Хэрэглээний үнэ ба үйлдвэрлэгчийн үнэ, сараар",
    source: "Үндэсний статистикийн хороо",
    months,
    updated: months[months.length - 1] || null,
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      short: p.short,
      unit: p.unit,
      category: p.category,
      cpi: months.map((mo) => {
        const v = cpiBy.get(`${mo}|${p.id}`);
        return v == null ? null : v;
      }),
      ppi: months.map((mo) => {
        const v = ppiBy.get(`${mo}|${p.id}`);
        return v == null ? null : v;
      }),
    })),
  };
}

export async function seedFromJson(updatedBy = "seed") {
  await ensureCpiPpiTables();
  const full = path.join(process.cwd(), JSON_PATH);
  const data = JSON.parse(await fs.readFile(full, "utf8"));

  await db.raw(`DELETE FROM ${CPI_TABLE}`);
  await db.raw(`DELETE FROM ${PPI_TABLE}`);
  await db.raw(`DELETE FROM ${PRODUCT_TABLE}`);

  let order = 0;
  for (const p of data.products || []) {
    await db.raw(
      `
      INSERT INTO ${PRODUCT_TABLE} (id, name, short, unit, category, sort_order)
      VALUES (?,?,?,?,?,?)
      `,
      [p.id, p.name, p.short || p.name, p.unit || null, p.category || null, order++],
    );
  }

  const months = data.months || [];
  const chunk = 50;
  const cpiBatch = [];
  const ppiBatch = [];
  for (const p of data.products || []) {
    for (let i = 0; i < months.length; i += 1) {
      const mo = months[i];
      const cpi = p.cpi?.[i];
      const ppi = p.ppi?.[i];
      if (cpi != null && !Number.isNaN(Number(cpi))) {
        cpiBatch.push({ month: mo, product_id: p.id, value: Number(cpi) });
      }
      if (ppi != null && !Number.isNaN(Number(ppi))) {
        ppiBatch.push({ month: mo, product_id: p.id, value: Number(ppi) });
      }
    }
  }

  async function insertBatch(table, rows) {
    for (let i = 0; i < rows.length; i += chunk) {
      const slice = rows.slice(i, i + chunk);
      if (!slice.length) continue;
      await db.raw(
        `
        INSERT INTO ${table} (month, product_id, value, updated_by)
        VALUES ${slice.map(() => "(?,?,?,?)").join(",")}
        `,
        slice.flatMap((r) => [r.month, r.product_id, r.value, updatedBy]),
      );
    }
  }

  await insertBatch(CPI_TABLE, cpiBatch);
  await insertBatch(PPI_TABLE, ppiBatch);

  return {
    products: data.products?.length || 0,
    months: months.length,
    cpiRows: cpiBatch.length,
    ppiRows: ppiBatch.length,
  };
}

export function nextMonth(yyyyMm) {
  const [y, m] = String(yyyyMm).split("-").map(Number);
  if (!y || !m) return null;
  const d = new Date(y, m - 1 + 1, 1);
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${yy}-${mm}`;
}
