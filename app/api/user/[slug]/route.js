import { NextResponse } from "next/server";
import { getUserInfoModel } from "@/app/services/model/UserModel";

export async function GET(request, { params: { slug } }) {
  if (!request.headers.get("X-API-Key")) {
    return NextResponse.json({ message: "Unauthorized" });
  }
  if (!slug) {
    return NextResponse.json({ message: "slug not found" });
  }

  if (request.headers.get("X-API-Key") === process.env.X_API_KEY) {
    const res = await getUserInfoModel(slug);

    return NextResponse.json(res);
  }
}
