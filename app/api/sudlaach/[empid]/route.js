import { NextResponse } from "next/server";
import { getEmployeeCard, parseEmpId } from "@/app/lib/hr-emp";

export const dynamic = "force-dynamic";

export async function GET(_req, context) {
  const { empid } = await context.params;
  const id = parseEmpId(empid);
  if (!id) {
    return NextResponse.json({ status: false, message: "EmpID буруу байна." }, { status: 400 });
  }

  const result = await getEmployeeCard(id);
  if (!result.ok) {
    const status = result.reason === "not-found" ? 404 : result.reason === "not-configured" ? 503 : 502;
    return NextResponse.json({ status: false, reason: result.reason }, { status });
  }

  return NextResponse.json(
    { status: true, data: result.emp },
    { headers: { "Cache-Control": "private, max-age=60" } },
  );
}
