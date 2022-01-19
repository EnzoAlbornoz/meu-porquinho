// Import Dependencies
import { MongoClient, type MongoClientOptions } from "mongodb";
// Define URI
const uri = `mongodb://${process.env.MONGO_HOST || "localhost"}:${
    process.env.MONGO_PORT || "27017"
}/${process.env.MONGO_DB || "admin"}`;

const options: MongoClientOptions = {
    auth: {
        username: process.env.MONGO_USER,
        password: process.env.MONGO_PASS,
    },
    authSource: "admin",
    authMechanism: "SCRAM-SHA-1",
};

let clientConn;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).

    if (!globalThis._mongoClientPromise) {
        clientConn = new MongoClient(uri, options);
        globalThis._mongoClientPromise = clientConn.connect();
    }
    clientPromise = globalThis._mongoClientPromise;
} else {
    // In production mode, it's best to not use a global variable.
    clientConn = new MongoClient(uri, options);
    clientPromise = clientConn.connect();
}

export function getDb(databaseName: string = process.env.MONGO_DB) {
    return clientPromise.then((client) => client.db(databaseName));
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export const client = clientPromise;
export default clientPromise;
