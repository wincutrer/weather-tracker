import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRoutes from "./apiRoutes"; // Import API routes

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api", apiRoutes);

const PORT = process.env.PORT || 5050;

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
