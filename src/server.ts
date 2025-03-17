import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";

import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import subscriptionRoutes from "./routes/subscriptionRoutes";
import emailRoutes from "./routes/emailRoutes";

dotenv.config({ path: path.resolve(__dirname, "../.env") });
const app = express();

app.use(cors());
app.use(express.json());

// ✅ Mount API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/emails", emailRoutes);

app.use(
  cors({
    origin: ["https://accounts.thatdisabilityadventurecompany.com.au", "http://localhost:3000"], // ✅ Allow frontend domains
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

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