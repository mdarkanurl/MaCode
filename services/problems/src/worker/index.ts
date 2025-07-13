import express from "express";
import { sendMessage } from "./queue/sendMessage";

const app = express();

app.get("/send", async (req, res) => {
  res.status(200).send("Message sent to the queue");
});

app.listen(3001, async () => {
  console.log("Server is running on port 3001");
  await sendMessage();
});