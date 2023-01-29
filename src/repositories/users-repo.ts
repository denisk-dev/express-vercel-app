import { usersCollection } from "../db/db";

export const usersDataAccessLayer = {
  async addUser(
    login: string,
    password: string,
    email: string,
    createdAt: Date,
    id: string
  ) {
    try {
      return await usersCollection.insertOne({
        login,
        password,
        email,
        createdAt,
        id,
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  },
  async deleteUser(id: string) {
    // let _id = ObjectId(id);
    try {
      return await usersCollection.deleteOne({ id });
    } catch (e) {
      console.log(e);
      return null;
    }
  },

  async removeAllUsers() {
    await usersCollection.deleteMany({});
  },
};

export default usersDataAccessLayer;
