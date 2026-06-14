import mongoose from "mongoose";

const ninSchema = new mongoose.Schema(
  {
    nin: {
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
  },
  { timestamps: true }
);
export default mongoose.model("NIN", ninSchema);