import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import subscriptionRoutes from "./routes/subscriptionRoutes";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// ✅ Mount API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/subscriptions", subscriptionRoutes);

// 🔹 Block public access to the API root (`/`)
app.get("/", (req, res) => {
  res.status(403).json({ message: "Forbidden" });
});

// 🔹 Handle unknown routes
app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));