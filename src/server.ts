import mongoose from "mongoose";
import app from "./app";
import config from "./config/config";

const main = async () => {
  try {
    await mongoose.connect(config.dbUri);

    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
    });
  } catch (err: any) {
    console.log("Error durning server start: ", err.message);
  }
};

main();
