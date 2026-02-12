const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    const response = await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.DB_NAME,
    });
    console.log("Mongodb Connected");
  } catch (error) {
    console.log("error while connecting to database", error);
  }
};

module.exports = connectDb;
