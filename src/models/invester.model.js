import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const investerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  content: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
});

investerSchema.plugin(mongooseAggregatePaginate);

export const Invester = mongoose.model("Invester", investerSchema);
