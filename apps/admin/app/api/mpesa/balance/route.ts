import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export async function GET() {
  const token = await getToken();

  const securityCredential = generateSecurityCredential(
    process.env.B2C_INITIATOR_PASSWORD!
  );

  const payload = {
    Initiator: process.env.B2C_INITIATOR_NAME!,
    SecurityCredential: securityCredential,
    CommandID: "AccountBalance",
    PartyA: process.env.MPESA_SHORTCODE!,
    IdentifierType: "4",
    Remarks: "Checking balance",
    ResultURL: process.env.MPESA_ACCOUNT_BALANCE_RESULT_URL!,
    QueueTimeOutURL: process.env.MPESA_ACCOUNT_BALANCE_TIMEOUT_URL!,
  };

  const res = await fetch(
    "https://api.safaricom.co.ke/mpesa/accountbalance/v1/query",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await res.json();
  return NextResponse.json(data);
}

async function getToken() {
  const consumerKey = process.env.MPESA_KEY!;
  const consumerSecret = process.env.MPESA_SECRET!;
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString(
    "base64"
  );

  const res = await fetch(
    "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      headers: { Authorization: `Basic ${auth}` },
    }
  );
  const json = await res.json();
  return json.access_token;
}

function generateSecurityCredential(password: string) {
  try {
    const certPath = path.join(
      process.cwd(),
      "assets/certs/ProductionCertificate.cer"
    );

    const cert = fs.readFileSync(certPath, "utf8");

    const encrypted = crypto.publicEncrypt(
      {
        key: cert,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      Buffer.from(password)
    );

    return encrypted.toString("base64");
  } catch (error) {
    console.error("Error generating security credentials:", error);
    throw error;
  }
}
