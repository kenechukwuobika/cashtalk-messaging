const Sequelize = require("sequelize");
const fs = require("fs");
const config = require("./environment");

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: "postgres",
    raw: true,
    port: config.port,
    seederStorage: process.env.SEEDER_STORAGE,
    dialectOptions: {
      ssl: {
        ca: fs.readFileSync(`${__dirname}/ca-certificate.crt`)
      }
    },
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
    console.log("Connection to database establised");
  })
  .catch(err => {
    console.error(`Unable to connect to database: ${err}`);
  });
module.exports = sequelize;
