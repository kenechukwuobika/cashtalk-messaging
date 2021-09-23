const express = require("express");
require("dotenv").config();
const helmet = require("helmet");

const app = express();
const cors = require("cors");
const amqp = require("amqplib");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const { insertIntoChat } = require("./eventCalls/chatCalls");

let channel;
let connection;
const QUEUE = "TestQueue";

app.disable("etag");

app.use(helmet());

app.use(morgan("combined"));

app.use(cors());
app.use(express.json());

app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
require("./routes/routes")(app);

app.get("/", (req, res) => {
  res.send(`BoilerPlate v.1.0 ${new Date()}`);
});

async function messageQueue() {
  try {
    const amqpServer = "amqp://localhost";
    connection = await amqp.connect(amqpServer);
    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE);
  } catch (error) {
    console.error(error.message);
    throw new Error("An Error Occured");
  }
}

messageQueue().then(async () => {
  await channel.consume(QUEUE, data => {
    const { recipients, text, sender } = JSON.parse(data.content);
    insertIntoChat(recipients, text, sender);
    channel.ack(data);
  });
});

// Handles all errors
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(err.status || 400).send({ success: false });
  }
  return res
    .status(err.status || 400)
    .send({ success: false, message: err.message });
});

app.use((req, res) => res.status(500).send({ success: false }));

app.listen(process.env.APP_PORT, () => {
  console.log(`Listening on port: ${process.env.APP_PORT} 🌎`);
});

module.exports = app;
