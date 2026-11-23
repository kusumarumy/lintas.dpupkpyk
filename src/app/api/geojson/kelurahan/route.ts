import { getGeoJSON } from "@/lib/r2";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const geojson = await getGeoJSON("vektor/Kelurahan.geojson");

    if (geojson.type !== "FeatureCollection" || !Array.isArray(geojson.features)) {
      return Response.json({ error: "Format GeoJSON kelurahan tidak valid." }, { status: 502 });
    }

    return Response.json(geojson, {
      headers: { "Cache-Control": "public, max-age=300, s-maxage=900" },
    });
  } catch (error) {
    console.error("Gagal mengambil GeoJSON kelurahan:", error);
    return Response.json(
      { error: "Data kelurahan gagal dimuat dari Cloudflare R2." },
      { status: 502 }
    );
  }
}
