import mongoose from "mongoose";
import { ServerApiVersion } from "mongodb";

export const connectDb = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is not set. Use your Atlas SRV connection string in .env");
  }

  if (uri.includes("<db_password>")) {
    throw new Error("MONGO_URI still contains <db_password>. Replace it with your real password");
  }

  await mongoose.connect(uri, {
    autoIndex: true,
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true
    }
  });
};
