import { NextResponse } from "next/server";
import { nocobaseListResource, nocobaseRequest } from "@/lib/nocobase";

export const runtime = "nodejs";

type LocationRecord = {
  name?: string;
  location?: unknown;
};

function parseCoordinates(value: unknown): [number, number] | null {
  let coordinates: unknown = value;
  if (typeof value === "string") {
    try {
      coordinates = JSON.parse(value);
    } catch {
      const pair = value.split(",").map(Number);
      if (pair.length === 2 && pair.every(Number.isFinite)) return [pair[0], pair[1]];
      return null;
    }
  }
  if (typeof coordinates === "object" && coordinates !== null && "coordinates" in coordinates) {
    coordinates = (coordinates as { coordinates: unknown }).coordinates;
  }
  if (
    Array.isArray(coordinates) &&
    coordinates.length >= 2 &&
    Number.isFinite(Number(coordinates[0])) &&
    Number.isFinite(Number(coordinates[1]))
  ) {
    return [Number(coordinates[0]), Number(coordinates[1])];
  }
  return null;
}

export async function GET() {
  const key = process.env.AMAP_WEB_KEY?.trim();
  if (!key) {
    return NextResponse.json({ error: "地图服务尚未配置。" }, { status: 503 });
  }

  try {
    const collection = process.env.NOCOBASE_LOCATION_COLLECTION?.trim() || "locations";
    const records = await nocobaseRequest<LocationRecord[]>(
      nocobaseListResource(collection, {
        fields: "name,location",
        pageSize: "1",
        sort: "-createdAt",
      }),
    );
    const record = records[0];
    const coordinates = parseCoordinates(record?.location);
    if (!record?.name || !coordinates) {
      return NextResponse.json({ error: "尚未配置可公开展示的地点。" }, { status: 404 });
    }

    return NextResponse.json({
      key,
      securityCode: process.env.AMAP_SECURITY_CODE?.trim() || "",
      location: { name: record.name, longitude: coordinates[0], latitude: coordinates[1] },
    });
  } catch (error) {
    console.error("Public map data request failed", error);
    return NextResponse.json({ error: "地图数据暂时不可用。" }, { status: 502 });
  }
}
