import mongoose from "mongoose";

const investerSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
});

export const Invester = mongoose.model("Invester", investerSchema);
