import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
const options = {};

let client; MongoClient;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
    throw new Error("Por favor, configure a variavel de ambiente MONGODB_URI no arquivo .env")
}

if (process.env.NODE_ENV === "development") {
    // Em desenvolvimento, reutilize o cliente para evitar muitas conexões
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    // Em produção, crie uma nova conexão
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
  
  export default clientPromise;