import express from "express";
import apicache from "apicache";

export const router = express.Router();
const cache = apicache.middleware;
// Serving Static Folder
router.get("/", (req, res) => {
  res.sendFile("/index.html");
});

// Api Route
router.get("/api", cache("15 minutes"), async (req, res) => {
  res.send("Api Route Working!");
});
