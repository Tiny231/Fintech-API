import app from "./app.js";
import connectDB from "./src/configs/database.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 4040;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on  http://localhost:${PORT}`);
  });
});
