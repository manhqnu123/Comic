import mongoose from "mongoose";

const newProductSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    thumbnail: {
      type: String,
      default: "",
    },

    author: {
      type: String,
      default: "",
    },

    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true },
);

const NewProduct = mongoose.model("NewComic", newProductSchema);
export default NewProduct;
