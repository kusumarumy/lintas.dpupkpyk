import { r2Url } from "@/lib/r2";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const { path } = await params;

    if (
      !Array.isArray(path) ||
      path.length === 0 ||
      path.some(
        (segment) =>
          !segment ||
          segment === "." ||
          segment === ".." ||
          segment.includes("/") ||
          segment.includes("\\") ||
          /[\u0000-\u001f\u007f]/.test(segment)
      )
    ) {
      return Response.json(
        { error: "Path aset tidak valid." },
        { status: 400 }
      );
    }

    const key = path.join("/");
    const upstream = await fetch(r2Url(key), {
      cache: "no-store",
      redirect: "follow",
    });

    if (!upstream.ok) {
      return Response.json(
        { error: "Aset tidak ditemukan atau gagal diambil." },
        { status: upstream.status === 404 ? 404 : 502 }
      );
    }

    const headers = new Headers();

    const contentType = upstream.headers.get("content-type");

    if (contentType) {
      headers.set("Content-Type", contentType);
    }

    const contentLength = upstream.headers.get("content-length");

    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }

    headers.set(
      "Cache-Control",
      "public, max-age=3600, s-maxage=86400"
    );

    return new Response(upstream.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Gagal mengambil aset R2:", error);

    return Response.json(
      { error: "Server gagal mengambil aset dari R2." },
      { status: 502 }
    );
  }
}