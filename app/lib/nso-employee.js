import { createHmac } from "node:crypto";

function readEnv(name) {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : "";
}

export function getEmployeeApiBase() {
  return (readEnv("EMPLOYEE_API_BASE") || "https://nso-dashboard.app.nso.mn").replace(
    /\/$/,
    "",
  );
}

export function isEmployeeApiConfigured() {
  return Boolean(readEnv("EMPLOYEE_API_TOKEN"));
}

export function isEmployeePhotoApiConfigured() {
  return Boolean(readEnv("EMPLOYEE_API_SECRET"));
}

export async function getEmployee(empId) {
  const token = readEnv("EMPLOYEE_API_TOKEN");
  if (!token) return null;

  const response = await fetch(`${getEmployeeApiBase()}/api/employee/${empId}`, {
    headers: { "X-Api-Token": token },
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`employee ${empId}: ${response.status} ${await response.text()}`);
  }
  return response.json();
}

export function photoUrl(empId, ttlSeconds = 3600) {
  const secret = readEnv("EMPLOYEE_API_SECRET");
  if (!secret) return "";
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const sig = createHmac("sha256", secret).update(`${empId}.${exp}`).digest("hex");
  return `${getEmployeeApiBase()}/api/employee/${empId}/photo?exp=${exp}&sig=${sig}`;
}
