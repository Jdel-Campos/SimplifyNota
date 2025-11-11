import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
let client: MongoClient | null = null;
async function getClient() {
  if (client && (client as any).topology?.isConnected()) return client;
  client = new MongoClient(uri, { maxPoolSize: 3 });
  await client.connect();
  return client;
};

export async function GET(req: NextRequest) {
  const eventName = req.nextUrl.searchParams.get("eventName") || "";
  const eventDate = req.nextUrl.searchParams.get("eventDate") || "";

  try {
    const cx = await getClient();
    const db = cx.db(process.env.MONGODB_DB || "app");

    const defaultCC = process.env.DEFAULT_COST_CENTER || null;

    const rules = await db.collection("cost_center_rules").find({}).toArray();
    for (const r of rules) {
      try {
        const rx = new RegExp(r.pattern, "i");
        if (rx.test(eventName)) {
          return NextResponse.json({ costCenter: r.code });
        }
      } catch {}
    }

    if (defaultCC) return NextResponse.json({ costCenter: defaultCC });

    return NextResponse.json({ costCenter: null });
  } catch (e) {
    console.error("cost-center resolve error:", e);
    return NextResponse.json({ costCenter: null }, { status: 200 });
  }
};