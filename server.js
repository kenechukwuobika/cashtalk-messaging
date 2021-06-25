const express = require("express");
require("dotenv").config();
const helmet = require("helmet");
const app = express();

const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");

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
