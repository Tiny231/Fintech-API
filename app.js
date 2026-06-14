import dotenv from "dotenv";
dotenv.config();

import express from "express";  
import nibssRoute from "./src/route/nibssRoute.js";

const app = express();

app.use(express.json());

app.use("/api/nibss", nibssRoute);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});
export default app;
