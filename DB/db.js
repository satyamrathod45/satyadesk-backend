import mongoose, { connect } from "mongoose";

const conncetDB = async () => {
  try {
    await mongoose.connect(process.env.MONGOURI);
    console.log("Conncetion Successful🌳");
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

export default conncetDB;
