import mongoose from "mongoose";

const TrackedCitySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    lat: {
      type: Number,
      required: true,
    },
    lon: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "USD",
    },
    pop: {
      type: Number,
      default: 0,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  { timestamps: true }
);

// Prevent model overwrite in development hot-reloading
export default mongoose.models.TrackedCity ||
  mongoose.model("TrackedCity", TrackedCitySchema);
