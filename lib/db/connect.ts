import mongoose from "mongoose";

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

const cached = global.mongooseCache ?? { conn: null, promise: null };
global.mongooseCache = cached;

export function getMongoUri() {
  const dedicated = process.env.MONGODB_URI;
  const shared = process.env.DATABASE_URL;
  const fallback = "mongodb://127.0.0.1:27018/travels-tours?replicaSet=rs0";

  // Local `predev` starts Mongo on 127.0.0.1 — prefer that so seed + Next share data.
  // Production/Vercel should set MONGODB_URI (or DATABASE_URL) to Atlas.
  if (
    process.env.NODE_ENV !== "production" &&
    shared &&
    (shared.includes("127.0.0.1") || shared.includes("localhost"))
  ) {
    return shared;
  }

  return dedicated ?? shared ?? fallback;
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    mongoose.set("strictQuery", true);
    cached.promise = mongoose.connect(getMongoUri(), {
      bufferCommands: false,
      maxPoolSize: 10,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
