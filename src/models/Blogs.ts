import mongoose from "mongoose";

const { Schema } = mongoose;

const blogSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    websiteUrl: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    isMembership: { type: Boolean },
  },
  { versionKey: false }
);

const Blogs = mongoose.model("blogs", blogSchema);

export default Blogs;
