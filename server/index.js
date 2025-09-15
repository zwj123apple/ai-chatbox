// ============= server/index.js =============
const express = require("express");
const cors = require("cors");
const { AIService } = require("./ai.service");

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.post("/api/chat", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  AIService.sendMessage(req, res);
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
