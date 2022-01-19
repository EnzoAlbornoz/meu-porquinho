/// <reference types="node" />

// Extend the NodeJS namespace with Next.js-defined properties
declare namespace NodeJS {
    interface ProcessEnv {
        readonly MONGO_HOST: string;
        readonly MONGO_PORT: string;
        readonly MONGO_USER: string;
        readonly MONGO_PASS: string;
        readonly MONGO_DB: string;
    }
}

declare module globalThis {
    import type { MongoClient } from "mongodb";
    var _mongoClientPromise: Promise<MongoClient>;
}
