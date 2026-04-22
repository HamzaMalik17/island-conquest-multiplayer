import mongoose from 'mongoose';
import { config } from 'dotenv';

config({ path: './config.env' }); 

const connectDB = async () => {
  try {
    console.log(process.env.MONGO_URI)
    const conn = await mongoose.connect(process.env.MONGO_URI, {
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1); 
  }
};

export default connectDB;