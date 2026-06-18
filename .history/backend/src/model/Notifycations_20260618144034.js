import mongoose from "mongoose";
import params from "../config/params.js";

const notifycationSchema = new mongoose.Schema(
  {
    newComic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NewComic",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      default: "",
    },

    receivedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + p),
    },
  },
  { timestamps: true },
);

const Notifycation = mongoose.model("Notifycation", notifycationSchema);
export default Notifycation;
