const mongoose = require("mongoose");

const connectDB = async (url) => {
  try {
    const conn = await mongoose.connect(url);
    console.log(`Database Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Database Error; ${err}`);
  }
};

module.exports = connectDB;
