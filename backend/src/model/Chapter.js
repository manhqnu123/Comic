import mongoose from "mongoose";

const chapterSchema = new mongoose.Schema(
  {
    comic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comic",
      required: true,
    },
    title: {
      type: String,
      default: "",
    },
    chapterNumber: {
      type: Number,
      required: true
    },
    img: [
      {
        type: String,
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const Chapter = mongoose.model("Chapter", chapterSchema);
export default Chapter;