import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

if(!process.env.DATABASE_URL){
    throw new Error("Database url is not defined");
}

export const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL
})

export const db = drizzle(pool);

const connectDB = async () => {
    console.log(process.env.MONGODB_URI);
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`);
        console.log(`MONGODB CONNECTED SUCCESSFULLY !!! DB HOST : ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB CONNECTION FAILED !!!", error);
        process.exit(1);
    }
}

export default connectDB