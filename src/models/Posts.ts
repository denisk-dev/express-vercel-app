import mongoose from "mongoose";

const { Schema } = mongoose;

const usersSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
  userLogin: { type: String, required: true },
});

const commentsSchema = new Schema(
  {
    createdAt: { type: Date, default: Date.now },
    content: { type: String, required: true },
    commentatorInfo: { type: usersSchema, required: true },
  },
  { _id: false }
);

const postSchema = new Schema(
  {
    title: { type: String, required: true },
    shortDescription: { type: String, required: true },
    content: { type: String, required: true },

    blogId: { type: Schema.Types.ObjectId, ref: "blogs", required: true },
    blogName: { type: String, required: true },

    createdAt: { type: Date, default: Date.now },
    comments: { type: [commentsSchema], required: true },
  },
  { versionKey: false }
);

const PostsSchema = mongoose.model("posts", postSchema);

export default PostsSchema;
