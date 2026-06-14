import mongoose from "mongoose";

const fintechSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    bankCode: {
      type: String,
      trim: true,
    },  
    
    bankName: {
      type: String,
      trim: true,
    },
   
  },
  { timestamps: true }
);

export default mongoose.model("Fintech", fintechSchema);