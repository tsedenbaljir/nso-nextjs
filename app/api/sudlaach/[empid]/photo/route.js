import { NextResponse } from "next/server";
import { getEmployeePhoto, parseEmpId } from "@/app/lib/hr-emp";

export const dynamic = "force-dynamic";

export async function GET(_req, context) {
  const { empid } = await context.params;
  const id = parseEmpId(empid);
  if (!id) {
    return new NextResponse(null, { status: 400 });
  }

  const photo = await getEmployeePhoto(id);
  if (!photo) {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(new Uint8Array(photo.data), {
    status: 200,
    headers: {
      "Content-Type": photo.mime,
      "Content-Length": String(photo.data.length),
      "Cache-Control": "private, max-age=300",
    },
  });
}
