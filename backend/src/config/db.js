import mongoose from "mongoose";

export const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
        console.log("Kết nối thành công");
    } catch (error) {
        console.log("Lỗi kết nối DB",error);
    }
}