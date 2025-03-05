import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes"; 

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// ✅ Mount API routes
app.use("/api/auth", authRoutes);

// ✅ Test route
app.get("/test", (req, res) => {
    res.send("API is working!");
  });

app.get("/", (req, res) => {
  res.send("TDAC API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));