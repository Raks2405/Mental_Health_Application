import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import question from "./questions.json" with { type: "json" };

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.get("/questions", (_req, res) => res.json(question));


const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

export default app;
