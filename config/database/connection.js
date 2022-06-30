const fs = require("fs");
const Sequelize = require("sequelize");
const config = require("./environment");

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
    port: config.port,
    seederStorage: config.seederStorage,
    dialectOptions: config.dialectOptions,
    raw: true,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    operatorsAliases: true
  }
);

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection to database established");
  })
  .catch(err => {
    console.error(`Unable to connect to database: ${err}`);
  });
module.exports = sequelize;
