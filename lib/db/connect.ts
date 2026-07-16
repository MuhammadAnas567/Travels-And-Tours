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

function isLocalUri(uri: string) {
  return uri.includes("127.0.0.1") || uri.includes("localhost");
}

export function getMongoUri() {
  const dedicated = process.env.MONGODB_URI?.trim();
  const shared = process.env.DATABASE_URL?.trim();
  const fallback = "mongodb://127.0.0.1:27018/travels-tours?replicaSet=rs0";
  const production = process.env.NODE_ENV === "production";

  // Local `predev` starts Mongo on 127.0.0.1 — prefer that so seed + Next share data.
  if (!production && shared && isLocalUri(shared)) {
    return shared;
  }

  // Production must use Atlas (or another reachable host) — never localhost.
  const uri = dedicated || shared;
  if (production) {
    if (!uri || isLocalUri(uri)) {
      throw new Error(
        "Production requires MONGODB_URI (or DATABASE_URL) pointing to MongoDB Atlas — not localhost."
      );
    }
    return uri;
  }

  return uri || fallback;
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const uri = getMongoUri();
    mongoose.set("strictQuery", true);
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 10000,
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
}
