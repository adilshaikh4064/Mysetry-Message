import mongoose from "mongoose";

type connectionObject = {
    isConnectd?: number;
};

const connection: connectionObject = {};

async function dbConnect(): Promise<void> {
    if (connection.isConnectd) {
        console.log("already connected to database.");
        return;
    }
    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || "", {});
        // console.log(db);
        connection.isConnectd = db.connections[0].readyState;
    } catch (err) {
        // console.log("database connection failed", err);
        throw new Error("Error while connecting to database.");
    }
}

dbConnect();

export default dbConnect;
