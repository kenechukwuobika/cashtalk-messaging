// const env = process.env.NODE_ENV
const dotenv = require("dotenv").config();
const Sequelize = require("sequelize");

const sequelize = require("../config/database/connection");

const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;


db.messaging = require("./messaging")(sequelize, Sequelize);
module.exports = db;
