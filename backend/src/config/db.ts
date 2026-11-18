import mongoose from "mongoose";

export async function connectDB() {
    try {
        const uri = process.env.MONGODB_URI
        if (!uri) {
            throw Error('mongodb uri required')
        }

        await mongoose.connect(uri)
        console.log('database connect')
    } catch (error) {
        console.error(error)
        process.exit(1)
    }
}