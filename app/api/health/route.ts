export async function GET() {
  return Response.json(
    {
      status: "ok",
      service: "gid-turysta-frontend",
      stage: 1,
      timestamp: new Date().toISOString(),
    },
    { status: 200 },
  );
}
