import {
  getEmployee,
  isEmployeeApiConfigured,
  isEmployeePhotoApiConfigured,
  photoUrl,
} from "@/app/lib/nso-employee";

export function parseEmpId(raw) {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

function pick(row, ...keys) {
  if (!row || typeof row !== "object") return "";
  for (const key of keys) {
    const value = row[key];
    if (value != null && value !== "") return value;
  }
  return "";
}

function mapEmployeeRow(raw) {
  const row = raw?.data ?? raw?.employee ?? raw;
  if (!row || typeof row !== "object") return null;
  const empId = Number(pick(row, "empId", "EmpID", "empid"));
  if (!Number.isInteger(empId) || empId <= 0) return null;
  const hasPhotoRaw = pick(row, "hasPhoto", "HasPhoto");
  return {
    empId,
    familyName: String(pick(row, "familyName", "FamilyName")),
    surName: String(pick(row, "surName", "SurName")),
    givenName: String(pick(row, "givenName", "GivenName")),
    aimagCode: String(pick(row, "aimagCode", "AimagCode")),
    aimagName: String(pick(row, "aimagName", "AimagName")),
    professionName: String(pick(row, "professionName", "ProfessionName")),
    positionName: String(pick(row, "positionName", "PositionName")),
    hasPhoto:
      hasPhotoRaw === ""
        ? true
        : hasPhotoRaw === true ||
          hasPhotoRaw === 1 ||
          hasPhotoRaw === "1" ||
          hasPhotoRaw === "true",
    insertedDate: pick(row, "insertedDate", "InsertedDate") || null,
  };
}

/**
 * @param {number} empId
 * @returns {Promise<
 *   | { ok: true, emp: {
 *       empId: number,
 *       familyName: string,
 *       surName: string,
 *       givenName: string,
 *       aimagCode: string,
 *       aimagName: string,
 *       professionName: string,
 *       positionName: string,
 *       hasPhoto: boolean,
 *       insertedDate: string | Date | null,
 *     }}
 *   | { ok: false, reason: string }
 * >}
 */
export async function getEmployeeCard(empId) {
  if (!isEmployeeApiConfigured()) {
    return { ok: false, reason: "not-configured" };
  }

  try {
    const raw = await getEmployee(empId);
    if (!raw) return { ok: false, reason: "not-found" };
    const emp = mapEmployeeRow(raw);
    if (!emp) return { ok: false, reason: "not-found" };
    return { ok: true, emp };
  } catch (error) {
    console.error("getEmployeeCard api:", error.message);
    return { ok: false, reason: "api-error" };
  }
}

export async function getEmployeePhoto(empId) {
  if (!isEmployeePhotoApiConfigured()) return null;

  try {
    const url = photoUrl(empId);
    if (!url) return null;
    const response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) return null;
    const bytes = Buffer.from(await response.arrayBuffer());
    const mime = String(response.headers.get("content-type") || "")
      .split(";")[0]
      .trim();
    if (mime.startsWith("image/")) {
      return { mime, data: bytes };
    }
    if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
      return { mime: "image/jpeg", data: bytes };
    }
    if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50) {
      return { mime: "image/png", data: bytes };
    }
    return null;
  } catch (error) {
    console.error("getEmployeePhoto api:", error.message);
    return null;
  }
}
