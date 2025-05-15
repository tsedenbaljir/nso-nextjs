import { getUserInfoModel } from "@/services/model/UserModel";

import { NextResponse } from "next/server";

type Props = {
  params: {
    slug: string;
  };
};

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
