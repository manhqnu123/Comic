import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        comic: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comic"
        },
        chapter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chapter"
        },
        content: {
            type: String,
            required: true
        },
        parentComment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
            default: null
        },
        likes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],
        status: {
            type: String,
            enum: ["active", "deleted"],
            default: "active"
        }
    }, {timestamps: true}
);

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;