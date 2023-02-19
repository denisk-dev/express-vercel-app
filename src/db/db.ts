import mongoose from "mongoose";
// import { Blogs, Posts, TAddUser } from "../types/types";

// Connection URI
const uri =
  process.env.mongoURI ||
  "mongodb+srv://m220student:m220password@mflix.mpemh2a.mongodb.net/";

export async function runDb() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await mongoose.connect(`${uri}samurai_three`);

    // // Establish and verify connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Connected successfully to server");
  } catch (e) {
    console.log(e);
    console.log("cant' connect to db");
    mongoose.disconnect();
  }
}

export default runDb;
