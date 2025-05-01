import { NextResponse } from "next/server";

const BASE_API_URL = process.env.BASE_API_URL; // Use this in production instead of hardcoded localhost
// export const dynamicParams = true;

// Helper function to fetch subsectors by ID
const getSubsectors = async (subsectorId) => {
  if (!subsectorId) {
    return [];
  }

  const API_URL = `${BASE_API_URL}/api/subsectorname?subsectorname=${decodeURIComponent(subsectorId)}&lng=mn`;

  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    return data?.data || [];
  } catch (error) {
    console.error(`Failed to fetch subsectors for ID ${subsectorId}:`, error);
    return [];
  }
};

export async function GET(req) {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/sectorname`);
    const sectors = await response.json();

    // Fetch subsectors for each sector
    const allSubsectors = [];

    for (const sector of sectors.data) {
      const subs = await getSubsectors(sector.id);
      allSubsectors.push(...subs);
    }

    return NextResponse.json({
      data: allSubsectors
    });

  } catch (error) {
    console.error("API GET Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
