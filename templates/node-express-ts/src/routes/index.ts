import express from "express";
export const router = express.Router();
import apicache from "apicache";
let cache = apicache.middleware;

// Serving Static Folder
router.get("/", (req, res) => {
  res.sendFile("/index.html");
});

// Api Route
router.get("/api", cache("15 minutes"), async (req, res) => {
  res.send("Api Route Working!");
});
