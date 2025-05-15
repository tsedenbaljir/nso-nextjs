import { getUserModel, loginUserModel } from "@/services/model/UserModel";
import { NextResponse } from "next/server";

export async function POST(request) {
  const body = await request.json();

  const user = await loginUserModel(body.email, body.password);

  if (!user) {
    return NextResponse.json({
      success: false,
      message: "User not found",
    });
  }

  return NextResponse.json({
    success: true,
    message: "User found",
    user,
  });
}
export async function GET(request) {
  if (!request.headers.get("X-API-Key")) {
    return NextResponse.json({ message: "Unauthorized" });
  }

  if (request.headers.get("X-API-Key") === process.env.X_API_KEY) {
    const res = await getUserModel();
    return NextResponse.json(res);
  }

  return NextResponse.json({ message: "Unauthorized" });
}
