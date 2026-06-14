import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    kycType: {
      type: String,
      required: true,
      enum: ["bvn", "nin"],
      default: "bvn",
    },
    kycID: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    dob: {
      type: String,
      required: true,
    },

    nibssResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);