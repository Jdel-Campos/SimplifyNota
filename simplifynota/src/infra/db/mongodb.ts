import { MongoClient, MongoClientOptions } from "mongodb";

const uri = process.env.MONGODB_URI;
const options: MongoClientOptions = {};

if (!uri) throw new Error("Defina MONGODB_URI no .env");

declare global {
    // eslint-disable-next-line no-var
    var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise!;
} else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
}

const deriveDbName = () => {
    if (process.env.MONGODB_DB) return process.env.MONGODB_DB;
    try {
        const parsed = new URL(uri);
        const pathname = parsed.pathname?.replace(/^\//, "");
        return pathname || undefined;
    } catch {
        return undefined;
    }
};

const resolvedDbName = deriveDbName();

export const getMongoDb = async () => {
    const client = await clientPromise;
    return resolvedDbName ? client.db(resolvedDbName) : client.db();
};

export default clientPromise;