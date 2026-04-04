import e from "express";
import mongoose from "mongoose";


const readhistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  comic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comic",
    required: true
  },
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chapter",
    required: true
  },
  lastReadAt: {
    type: Date,
    default: Date.now
  }
}, {timestamps: true});

export default mongoose.model("ReadHistory", readhistorySchema);