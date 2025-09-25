import { NextRequest, NextResponse } from "next/server";
import {
  S3Client,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// S3 client with explicit configuration
const s3 = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = "zidallie-school-excel-files";

/**
 * Handles download requests
 * Example call: /api/download/reports/06a48a00-ac63-45c5-b319-936ac1e0c9af.csv
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ file: string[] }> }
) {
  try {
    // Await the params promise
    const params = await context.params;
    console.log("Download API called with params:", params);

    // Validate params
    if (!params?.file || params.file.length === 0) {
      console.error("No file path provided");
      return NextResponse.json(
        { error: "No file path provided" },
        { status: 400 }
      );
    }

    // Join path segments into full key
    const key = decodeURIComponent(params.file.join("/"));
    console.log("Attempting to download file with key:", key);

    // Validate AWS credentials
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.error("AWS credentials not configured");
      return NextResponse.json(
        { error: "AWS credentials not configured" },
        { status: 500 }
      );
    }

    let extension = "xlsx"; // default

    // Check if file exists first
    try {
      const headCommand = new HeadObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });
      const headResponse = await s3.send(headCommand);
      console.log("File exists in S3");

      const contentType = headResponse.ContentType;

      if (key.endsWith(".csv") || contentType?.includes("csv")) {
        extension = "csv";
      } else if (
        key.endsWith(".xlsx") ||
        contentType?.includes("spreadsheet")
      ) {
        extension = "xlsx";
      } else if (key.endsWith(".xls")) {
        extension = "xls";
      }
    } catch (headError: any) {
      console.error("File not found in S3:", headError);
      if (headError.name === "NotFound") {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }
      throw headError;
    }

    // Generate signed URL
    const customFilename = `smart_card_reports_${
      new Date().toISOString().split("T")[0]
    }.${extension}`;

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${customFilename}"`,
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 minutes
    console.log("Signed URL generated successfully");

    return NextResponse.json({ url: signedUrl });
  } catch (error: any) {
    console.error("Download API error:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    return NextResponse.json(
      {
        error: error.message || "Failed to generate signed URL",
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
