import { NextRequest, NextResponse } from "next/server";

function backendBase() {
  const raw = (process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1").trim().replace(/\/$/, "");
  return /\/api\/v1$/i.test(raw) ? raw : `${raw}/api/v1`;
}

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const query = request.nextUrl.search;
  const target = `${backendBase()}/${path.map(encodeURIComponent).join("/")}${query}`;
  const incomingKey = request.headers.get("x-admin-key")?.trim();
  const serverKey = (process.env.STAGE2_ADMIN_API_KEY || process.env.ADMIN_API_KEY || "").trim();
  const adminKey = incomingKey || serverKey;
  if (!adminKey) {
    return NextResponse.json({ message: "STAGE2_ADMIN_API_KEY / ADMIN_API_KEY is not configured on the frontend service" }, { status: 503 });
  }

  const headers = new Headers();
  headers.set("x-admin-key", adminKey);
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  const body = request.method === "GET" || request.method === "HEAD" ? undefined : await request.text();
  try {
    const response = await fetch(target, { method: request.method, headers, body, cache: "no-store" });
    const text = await response.text();
    return new NextResponse(text, { status: response.status, headers: { "content-type": response.headers.get("content-type") || "application/json; charset=utf-8" } });
  } catch (error) {
    return NextResponse.json({ message: `Backend недоступний: ${error instanceof Error ? error.message : "network error"}`, target }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
