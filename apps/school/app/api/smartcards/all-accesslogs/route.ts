import { NextRequest, NextResponse } from "next/server";
import { getValidToken, setTokenCookies } from "../utils/auth";
import { makeAuthenticatedRequest } from "../utils/requests";

export async function POST(req: NextRequest) {
  const res = new NextResponse();
  try {
    const {
      email,
      password,
      page = 1,
      tag,
      fetchAll = false,
    } = await req.json();

    if (!email || !password || !tag) {
      return NextResponse.json(
        { error: "email, password & tag required" },
        { status: 400 }
      );
    }

    const { token, tokenData } = await getValidToken(email, password);
    setTokenCookies(res, tokenData);

    // If fetchAll is true, fetch all pages and return combined data
    if (fetchAll) {
      // Fetch first page to get total pages
      const firstPageResponse = await makeAuthenticatedRequest(
        `https://api.terrasofthq.com/api/access-log?page=1&tags[]=${tag}`,
        token
      );
      const firstPageData = await firstPageResponse.json();

      if (!firstPageData.data || !Array.isArray(firstPageData.data.data)) {
        return NextResponse.json({
          status: 200,
          data: { data: [], total: 0 },
          message: "No data available",
        });
      }

      const totalPages = firstPageData.data.last_page || 1;
      const allRecords = [...firstPageData.data.data];

      // If there are more pages, fetch them all in parallel
      if (totalPages > 1) {
        const pagePromises: Promise<any[]>[] = [];

        // Fetch remaining pages (2 to totalPages)
        for (let pageNum = 2; pageNum <= totalPages; pageNum++) {
          pagePromises.push(
            makeAuthenticatedRequest(
              `https://api.terrasofthq.com/api/access-log?page=${pageNum}&tags[]=${tag}`,
              token
            )
              .then((response) => response.json())
              .then((data) => data.data?.data || [])
              .catch((error) => {
                console.error(`Error fetching page ${pageNum}:`, error);
                return [];
              })
          );
        }

        // Wait for all pages to complete
        const results = await Promise.all(pagePromises);

        // Combine all results
        results.forEach((pageData) => {
          allRecords.push(...pageData);
        });
      }

      return NextResponse.json({
        status: 200,
        data: {
          data: allRecords,
          total: allRecords.length,
          total_pages: totalPages,
          fetched_all: true,
        },
        message: "success",
      });
    }

    // Regular paginated request
    const terra = await makeAuthenticatedRequest(
      `https://api.terrasofthq.com/api/access-log?page=${page}&tags[]=${tag}`,
      token
    );

    return NextResponse.json(await terra.json());
  } catch (e: any) {
    console.error("API Error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// Optional: Add caching for better performance
export const runtime = "nodejs"; // Use Node.js runtime for better performance
export const dynamic = "force-dynamic"; // Ensure fresh data
