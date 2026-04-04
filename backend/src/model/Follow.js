import mongoose from "mongoose";

const followSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        comic: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comic"
        }
    }, {timestamps: true}
);
// tránh follow trùng - 1 user chỉ follow 1 comic duy nhất
followSchema.index({ user: 1, comic: 1 }, { unique: true });

const Follow = mongoose.model("Follow", followSchema);
export default Follow;