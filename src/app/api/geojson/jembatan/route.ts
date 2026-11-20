
import { getGeoJSON } from "@/lib/r2";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const geojson = await getGeoJSON("vektor/Jembatan.geojson");

    if (
      geojson.type !== "FeatureCollection" ||
      !Array.isArray(geojson.features)
    ) {
      return Response.json(
        { error: "Format GeoJSON tidak valid." },
        { status: 502 }
      );
    }

    return Response.json(geojson, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Gagal mengambil GeoJSON jembatan:", error);

    return Response.json(
      { error: "Data jembatan gagal dimuat dari server." },
      { status: 502 }
    );
  }
}
