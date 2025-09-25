import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { Readable } from "stream";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const uploadToS3 = async (file: File) => {
  const fileExtension = file.name.split(".").pop();
  const fileName = `kyc/${uuidv4()}-${file.name}`;

  const arrayBuffer = await file.arrayBuffer();

  const uploadCommand = new PutObjectCommand({
    Bucket: "zidallie-kyc",
    Key: fileName,
    Body: Buffer.from(arrayBuffer),
    ContentType: file.type,
    // ✅ Remove ACL line if you're using Object Ownership = Bucket Owner Enforced
    // ACL: 'public-read', ❌ This line causes the error
  });

  await s3.send(uploadCommand);

  const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
  return fileUrl;
};

// ✅ Excel-only upload
export const uploadExcelToS3 = async (file: File) => {
  // Only allow Excel files
  const allowedTypes = [
    "application/vnd.ms-excel", // .xls
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "text/csv", // .csv
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      "Invalid file type. Only Excel (.xls, .xlsx, .csv) files are allowed."
    );
  }

  const fileExtension = file.name.split(".").pop();
  const fileName = `${uuidv4()}.${fileExtension}`;
  const arrayBuffer = await file.arrayBuffer();

  const uploadCommand = new PutObjectCommand({
    Bucket: "zidallie-school-excel-files",
    Key: fileName,
    Body: Buffer.from(arrayBuffer),
    ContentType: file.type,
  });

  await s3.send(uploadCommand);

  return `https://zidallie-school-excel-files.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
};
