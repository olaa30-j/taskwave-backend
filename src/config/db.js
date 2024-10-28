import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URL}`);
    console.log("Connected to DB...")
  } catch (e) {
    console.log("failed connect with DB...")
    console.error(e.message)
    process.exit(1)
  }
};

export default connectDB;