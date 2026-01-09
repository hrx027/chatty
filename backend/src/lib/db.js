import mongoose from 'mongoose';
import dns from 'dns';

export const connectDB=async()=> {
    try {
        const mongoUri = process.env.MONGODB_URI;

        if (!mongoUri) {
            throw new Error("MONGODB_URI is not set");
        }

        if (mongoUri.startsWith("mongodb+srv://")) {
            try {
                dns.setServers(["1.1.1.1", "8.8.8.8"]);
            } catch {
            }
        }

        const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}
