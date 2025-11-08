import { getMongoDb } from "@/infra/db/mongodb";
import type { Receipt } from "@/shared/types/receipt";

const COLLECTION = "receipts";

export async function insertReceipt(data: Receipt) {
    const db = await getMongoDb();
    return db.collection(COLLECTION).insertOne({ ...data, createdAt: new Date() });
};

export async function listReceipts() {
    const db = await getMongoDb();
    return db.collection(COLLECTION).find({}).sort({ createdAt: -1 }).toArray();
};