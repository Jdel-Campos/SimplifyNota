import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { formatReceiptNumber, yyyy } from "@/shared/lib/ids";

const uri = process.env.MONGODB_URI!;
let client: MongoClient | null = null;

type CounterDoc = {
  _id: string;
  seq: number;
  createdAt?: Date;
};

async function getClient() {
  if (client && (client as any).topology?.isConnected()) return client;
  client = new MongoClient(uri, { maxPoolSize: 3 });
  await client.connect();
  return client;
};

export async function GET() {
  try {
    const cx = await getClient();
    const db = cx.db(process.env.MONGODB_DB || "app");
    const year = yyyy();

    const counters = db.collection<CounterDoc>("counters");

    const res = await counters.findOneAndUpdate(
      { _id: `receipt-${year}` },
      { $inc: { seq: 1 }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true, returnDocument: "after" }
    );

    const seq = res?.seq ?? 1;
    const number = formatReceiptNumber(year, seq);

    return NextResponse.json({ year, seq, number });
  } catch (e) {
    console.error("next-number error:", e);
    return NextResponse.json({ error: "counter-failed" }, { status: 500 });
  }
};