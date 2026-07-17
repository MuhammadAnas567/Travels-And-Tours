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

  if (!production && shared && isLocalUri(shared)) {
    return shared;
  }

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
    const isProd = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
    mongoose.set("strictQuery", true);
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
      maxPoolSize: isProd ? 10 : 5,
      serverSelectionTimeoutMS: isProd ? 10_000 : 5_000,
      connectTimeoutMS: isProd ? 10_000 : 5_000,
      socketTimeoutMS: isProd ? 20_000 : 10_000,
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
