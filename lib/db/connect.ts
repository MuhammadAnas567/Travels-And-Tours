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
  return (
    process.env.MONGODB_URI ??
    process.env.DATABASE_URL ??
    "mongodb://127.0.0.1:27018/travels-tours?replicaSet=rs0"
  );
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
