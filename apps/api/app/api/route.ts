export async function GET(req: Request) {
  return Response.json({
    status: "success",
    message: "Zidallie Handler",
    parentsAppVersion: "1.0.0",
    driversAppVersion: "1.0.0",
  });
}
