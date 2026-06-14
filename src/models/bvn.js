import mongoose from "mongoose";

const bvnSchema = new mongoose.Schema(
  {
    bvn: {
      type: String,
      required: true,
      unique: true,
      length: 11,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    dob: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);
export default mongoose.model("BVN", bvnSchema);