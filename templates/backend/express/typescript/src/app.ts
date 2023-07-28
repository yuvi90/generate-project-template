import rateLimit from "express-rate-limit";
import express from "express";
import dotenv from "dotenv";
import path from "path";
import { router } from "@src/routes";

// Define Environment
dotenv.config();

const app = express();

// Enable CORS
const cors = require("cors");
app.use(cors());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 5 Minutes
  max: 100,
});
app.use(limiter);
app.set("trust proxy", 1);

// Serve static files
const staticPath = path.join(__dirname, "../public");
app.use(express.static(staticPath));

// Api Routes
app.use("/", router);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
  if (process.env.NODE_ENV == "development")
    console.log(`Running in ${process.env.NODE_ENV} mode.`);
});
