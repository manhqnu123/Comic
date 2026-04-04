import mongoose from "mongoose";

const comicSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
        },
        des: {
            type: String,
            default: ""
        },
        author: {
            type: String,
            default: ""
        },
        coverImg: {
            type: String,
            default: "",
        },
        status: {
            type: String,
            enum: ["drop", "completed", "ongoing", "coming soon"],
            default: "ongoing"
        },
        genres: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Genre"
        }],
        views: {
            type: Number,
            default: 0
        }
    }, {timestamps: true}
);

const Comic = mongoose.model("Comic", comicSchema);
export default Comic;