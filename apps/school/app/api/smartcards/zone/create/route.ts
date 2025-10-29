import { NextRequest, NextResponse } from "next/server";
import { getValidToken } from "../../utils/auth";
import { makeAuthenticatedRequest } from "../../utils/requests";

export async function POST(req: NextRequest) {
  try {
    const { email, password, tags, body } = await req.json();

    // STEP 1: Authenticate
    const { token } = await getValidToken(email, password);

    // STEP 2: Create Zone
    const createRes = await makeAuthenticatedRequest(
      "https://api.terrasofthq.com/api/zone",
      token,
      { method: "POST", body: JSON.stringify(body) }
    );

    const createData = await createRes.json();

    if (!createRes.ok) {
      throw new Error(createData?.message || "Failed to create zone");
    }

    const zoneId = createData?.data?.id;
    if (!zoneId) throw new Error("Zone ID missing in response");

    // STEP 3: Add Tags to Zone (only if tags are provided)
    let tagResponse: any = null;
    if (Array.isArray(tags) && tags.length > 0) {
      const tagPayload = {
        tags,
        zone_id: zoneId,
      };

      const tagRes = await makeAuthenticatedRequest(
        `https://api.terrasofthq.com/api/tags/${zoneId}/add-tags-zones`,
        token,
        {
          method: "PUT",
          body: JSON.stringify(tagPayload),
        }
      );

      tagResponse = await tagRes.json();

      if (!tagRes.ok) {
        throw new Error(tagResponse?.message || "Failed to add tags to zone");
      }
    }

    // STEP 4: Return Combined Response
    return NextResponse.json(
      {
        message: "Zone created and tags added successfully",
        zone: createData.data,
        tagResponse,
      },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
