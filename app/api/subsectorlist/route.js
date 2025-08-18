import { NextResponse } from "next/server";

const BASE_API_URL = process.env.BASE_API_URL; // Use this in production instead of hardcoded localhost
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Helper function to fetch subsectors by ID
const getSubsectors = async (subsectorId, baseUrl) => {
  if (!subsectorId) {
    return [];
  }

  try {
    const response = await fetch(`${baseUrl}/api/subsectorname?subsectorname=${encodeURIComponent(subsectorId)}&lng=mn`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data?.data || [];
  } catch (error) {
    console.error(`Failed to fetch subsectors for ID ${subsectorId}:`, error);
    return [];
  }
};

export async function GET(req) {
  try {
    // Get the host from the request
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('host');
    const baseUrl = `${protocol}://${host}`;
    
    const response = await fetch(`${baseUrl}/api/sectorname?lng=mn`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NSO-API/1.0)',
        'Accept': 'application/json'
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const sectors = await response.json();
    console.log("sectors==================",sectors);
    
    // Fetch subsectors for each sector
    const allSubsectors = [];

    if (sectors.data && Array.isArray(sectors.data)) {
      for (const sector of sectors.data) {
        try {
          const subs = await getSubsectors(sector.id, baseUrl);
          allSubsectors.push(...subs);
        } catch (subError) {
          console.error(`Error fetching subsectors for sector ${sector.id}:`, subError);
          // Continue with other sectors even if one fails
        }
      }
    }

    return NextResponse.json({
      data: allSubsectors
    });

  } catch (error) {
    console.error("API GET Error:", error);
    return NextResponse.json({ 
      error: "Internal server error.", 
      details: error.message 
    }, { status: 500 });
  }
}
