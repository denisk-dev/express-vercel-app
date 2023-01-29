import { MongoClient } from "mongodb";
import { Blogs, Posts, TUsers } from "../types/types";

//TODO maybe connect to my DB on the localhost????

// Connection URI
const uri =
  process.env.mongoURI ||
  "mongodb+srv://m220student:m220password@mflix.mpemh2a.mongodb.net/";
// Create a new MongoClient
const client = new MongoClient(uri);

const db = client.db("samurai_three");

// TODO add types
export const postsCollection = db.collection<Posts>("posts");
export const blogsCollection = db.collection<Blogs>("blogs");
export const usersCollection = db.collection<TUsers>("users");

export async function runDb() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    // // Establish and verify connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Connected successfully to server");
  } catch (e) {
    console.log(e);
    console.log("cant' connect to db");
    await client.close();
  }
}
