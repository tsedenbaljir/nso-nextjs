import knex from "knex";

const globalKey = "__nso_hrdb_pool_v1";

function normalizeDbRows(result) {
  if (!result) return [];
  if (Array.isArray(result)) {
    if (Array.isArray(result[0])) return result[0];
    return result;
  }
  if (result.recordset && Array.isArray(result.recordset)) return result.recordset;
  if (result.rows && Array.isArray(result.rows)) return result.rows;
  return [];
}

function getHrdb() {
  const server = process.env.HRDB_SERVER;
  const user = process.env.HRDB_USER;
  const password = process.env.HRDB_PASSWORD;
  const database = process.env.HRDB_DATABASE || "HRDB";
  if (!server || !user || !password) return null;

  if (global[globalKey]) return global[globalKey];

  const db = knex({
    client: "mssql",
    connection: {
      server,
      port: Number(process.env.HRDB_PORT || 1433),
      user,
      password,
      database,
      options: {
        encrypt: true,
        trustServerCertificate: true,
        connectTimeout: 8000,
        requestTimeout: 15000,
        enableArithAbort: true,
      },
    },
    pool: {
      min: 0,
      max: 4,
      acquireTimeoutMillis: 10000,
      idleTimeoutMillis: 10000,
      createTimeoutMillis: 8000,
      destroyTimeoutMillis: 5000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 200,
      propagateCreateError: true,
    },
  });

  global[globalKey] = db;
  return db;
}

export function parseEmpId(raw) {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

export async function getEmployeeCard(empId) {
  const db = getHrdb();
  if (!db) return { ok: false, reason: "not-configured" };

  try {
    const rows = normalizeDbRows(
      await db.raw(
        `SELECT TOP 1
           [EmpID],
           [FamilyName],
           [SurName],
           [GivenName],
           [AimagCode],
           [AimagName],
           [ProfessionName],
           [PositionName],
           [StatusCode],
           [InsertedDate],
           CASE WHEN [EmpPic] IS NULL THEN 0 ELSE 1 END AS hasPhoto
         FROM [HRDB].[dbo].[vwEmp]
         WHERE [EmpID] = ?`,
        [empId],
      ),
    );
    const row = rows[0];
    if (!row) return { ok: false, reason: "not-found" };

    return {
      ok: true,
      emp: {
        empId: Number(row.EmpID ?? row.empId),
        familyName: row.FamilyName ?? row.familyName ?? "",
        surName: row.SurName ?? row.surName ?? "",
        givenName: row.GivenName ?? row.givenName ?? "",
        aimagCode: String(row.AimagCode ?? row.aimagCode ?? ""),
        aimagName: row.AimagName ?? row.aimagName ?? "",
        professionName: row.ProfessionName ?? row.professionName ?? "",
        positionName: row.PositionName ?? row.positionName ?? "",
        hasPhoto: Boolean(Number(row.hasPhoto ?? row.HasPhoto ?? 0)),
        insertedDate: row.InsertedDate ?? row.insertedDate ?? null,
      },
    };
  } catch (error) {
    console.error("getEmployeeCard:", error.message);
    return { ok: false, reason: "db-error" };
  }
}

function toBuffer(blob) {
  if (blob == null) return null;
  if (Buffer.isBuffer(blob)) return blob;
  if (blob instanceof ArrayBuffer) return Buffer.from(blob);
  if (ArrayBuffer.isView(blob)) {
    return Buffer.from(blob.buffer, blob.byteOffset, blob.byteLength);
  }
  if (Array.isArray(blob)) return Buffer.from(blob);
  if (typeof blob === "object" && Array.isArray(blob.data)) {
    return Buffer.from(blob.data);
  }
  if (typeof blob === "string") {
    const text = blob.trim();
    if (!text) return null;
    if (text.startsWith("data:image/")) {
      const b64 = text.slice(text.indexOf(",") + 1);
      return Buffer.from(b64, "base64");
    }
    const hex = text.startsWith("0x") ? text.slice(2) : text;
    if (/^[0-9A-Fa-f]+$/.test(hex) && hex.length % 2 === 0 && hex.length >= 32) {
      return Buffer.from(hex, "hex");
    }
    if (/^[A-Za-z0-9+/=\s]+$/.test(text) && text.length >= 64) {
      return Buffer.from(text.replace(/\s+/g, ""), "base64");
    }
  }
  return null;
}

function indexOfMagic(buf, magic, start = 0) {
  return buf.indexOf(magic, start);
}

function plausibleBmp(buf, offset) {
  if (offset + 14 > buf.length) return false;
  if (buf[offset] !== 0x42 || buf[offset + 1] !== 0x4d) return false;
  const size = buf.readUInt32LE(offset + 2);
  return size >= 54 && size <= buf.length - offset + 1024;
}

function dibToBmp(dib) {
  if (!dib || dib.length < 40) return null;
  const headerSize = dib.readUInt32LE(0);
  if (![12, 40, 108, 124].includes(headerSize)) return null;
  const width = dib.readInt32LE(4);
  const height = Math.abs(dib.readInt32LE(8));
  if (width < 8 || width > 8000 || height < 8 || height > 8000) return null;
  const bmp = Buffer.alloc(14 + dib.length);
  bmp.write("BM", 0);
  bmp.writeUInt32LE(14 + dib.length, 2);
  bmp.writeUInt32LE(0, 6);
  bmp.writeUInt32LE(14 + headerSize, 10);
  dib.copy(bmp, 14);
  return bmp;
}

function unwrapImage(input) {
  const buffer = toBuffer(input);
  if (!buffer || buffer.length < 8) return null;

  const jpegAt = indexOfMagic(buffer, Buffer.from([0xff, 0xd8, 0xff]));
  if (jpegAt >= 0) {
    return { mime: "image/jpeg", data: buffer.subarray(jpegAt) };
  }

  const pngAt = indexOfMagic(buffer, Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (pngAt >= 0) {
    return { mime: "image/png", data: buffer.subarray(pngAt) };
  }

  const gifAt = indexOfMagic(buffer, Buffer.from("GIF8"));
  if (gifAt >= 0) {
    return { mime: "image/gif", data: buffer.subarray(gifAt) };
  }

  let bmpAt = 0;
  while (bmpAt >= 0 && bmpAt < buffer.length - 14) {
    bmpAt = indexOfMagic(buffer, Buffer.from("BM"), bmpAt);
    if (bmpAt < 0) break;
    if (plausibleBmp(buffer, bmpAt)) {
      return { mime: "image/bmp", data: buffer.subarray(bmpAt) };
    }
    bmpAt += 1;
  }

  const oleNative = buffer.indexOf(Buffer.from("Ole10Native"));
  if (oleNative >= 0) {
    const rest = buffer.subarray(oleNative + 12);
    const nested = unwrapImage(rest);
    if (nested) return nested;
  }

  const dibKeys = ["CONTENTS", "PBrush", "Paint.Picture", "Bitmap Image"];
  for (const key of dibKeys) {
    const at = buffer.indexOf(Buffer.from(key));
    if (at < 0) continue;
    const rest = buffer.subarray(at + key.length);
    const nested = unwrapImage(rest);
    if (nested) return nested;
    for (let i = 0; i < Math.min(rest.length, 64); i += 1) {
      const bmp = dibToBmp(rest.subarray(i));
      if (bmp) return { mime: "image/bmp", data: bmp };
    }
  }

  const dib = dibToBmp(buffer);
  if (dib) return { mime: "image/bmp", data: dib };

  console.warn(
    "EmpPic unrecognized",
    buffer.length,
    buffer.subarray(0, 32).toString("hex"),
    buffer.subarray(0, 32).toString("latin1").replace(/[^\x20-\x7E]/g, "."),
  );
  return null;
}

export async function getEmployeePhoto(empId) {
  const db = getHrdb();
  if (!db) return null;

  try {
    const rows = normalizeDbRows(
      await db.raw(
        `SELECT TOP 1 [EmpPic] FROM [HRDB].[dbo].[vwEmp] WHERE [EmpID] = ?`,
        [empId],
      ),
    );
    const blob = rows[0]?.EmpPic ?? rows[0]?.empPic;
    if (!blob) return null;
    return unwrapImage(blob);
  } catch (error) {
    console.error("getEmployeePhoto:", error.message);
    return null;
  }
}
