const express = require("express");
require("dotenv").config();
const helmet = require("helmet");
const app = express();
const httpServer = require("http").createServer(app);
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const { queue, protectRoute } = require("cashtalk-common");
const wrap = require('./utilities/middlewareWrapper');
const Websocket = require("./socket/Websocket");
const router = require("./routes");
const io  = require('socket.io')(httpServer,{
  cors: {
    origin: '*',
    methods: '*'
  }
});

io.of('/api/v1').use(wrap(protectRoute));

io.of('/api/v1').on('connection', socket => {
    const webSocket = new Websocket(socket);
    webSocket.init();
});

// require("./routes/socketRoutes")(app, io);
app.use(express.json());

app.disable("etag");

app.use(helmet());

app.use(morgan("combined"));

app.use(cors());

app.use(
  bodyParser.urlencoded({
    extended: false
  })
);

app.use('/api/v1', router);

global.io = io;
global.socketUsers = [];

app.get("/", (req, res) => {
  res.send(`BoilerPlate v.1.0 ${new Date()}`);
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

httpServer.listen(process.env.PORT, async () => {
  await queue.initialize();
  await queue.consume();
  console.log(`Listening on port: ${process.env.PORT} 🌎`);
});

module.exports = app;
