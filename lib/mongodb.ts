import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error("Please define MONGODB_URI in .env");
}

const uri: string = MONGODB_URI;

type MongooseCache = {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
};

declare global {
    // eslint-disable-next-line no-var
    var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
    conn: null,
    promise: null,
};

global.mongooseCache = cached;

export async function connectDB() {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(uri, {
            bufferCommands: false,
            serverSelectionTimeoutMS: 10000,
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        // Drop the rejected promise so the next request can retry instead of
        // replaying the same failure forever.
        cached.promise = null;
        throw error;
    }

    return cached.conn;
}
