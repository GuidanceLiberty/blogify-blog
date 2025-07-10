import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', true);
    const connect = await mongoose.connect(process.env.DB_URI);
    console.log(`✅ Connected to database: ${connect.connection.host}`);
  } catch (error) {
    console.error(`❌ Error connecting to database: ${error.message}`);
    process.exit(1); // Exit with failure
  }
};

export default connectDB;
