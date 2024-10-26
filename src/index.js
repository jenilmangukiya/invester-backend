import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./db/connectDB.js";

dotenv.config({
  path: "./env",
});

const port = process.env.PORT || 8000;
console.log("process.env.PORT", process.env.PORT);

connectDB().then(() => {
  app.listen(port, () => {
    console.log("process.env.PORT", process.env.PORT);
    console.log(
      "Express server listing on the PORT ",
      process.env.PORT || 8000
    );
  });
});
