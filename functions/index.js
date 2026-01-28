const { onRequest } = require("firebase-functions/v2/https");
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

admin.initializeApp(); // uses the project’s default bucket
const app = express();
app.use(cors());
app.use(express.json());

let cache = { data: null, ts: 0 };

app.get("/questions", async (_req, res) => {
  try {
    if (cache.data && Date.now() - cache.ts < 60_000) {
      return res.json(cache.data);
    }

    const file = admin.storage().bucket().file("configs/questions.json");
    const [buf] = await file.download();
    const data = JSON.parse(buf.toString("utf8"));

    cache = { data, ts: Date.now() };
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load questions" });
  }
});

exports.api = onRequest(app);
