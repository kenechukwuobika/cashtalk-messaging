const dotenv = require("dotenv").config();
const fs = require("fs");

const environmentVariables = {
  development: {
    host: process.env.HOST,
    database: process.env.DATABASE,
    username: process.env.DB_USERNAME,
    password: process.env.PASSWORD,
    port: process.env.DB_PORT,
    dialect: process.env.DIALECT,
    secret: process.env.SECRET,
    seederStorage: process.env.SEEDER_STORAGE,
    dialectOptions: {
      ssl: {
        ca: fs.readFileSync(`${__dirname}/ca-certificate.crt`)
      }
    }
  },
  production: {
    host: process.env.RDS_HOSTNAME,
    database: process.env.RDS_DB_NAME,
    username: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    port: process.env.RDS_PORT,
    dialect: process.env.DIALECT,
    secret: process.env.SECRET,
    seederStorage: process.env.SEEDER_STORAGE
  }
};
console.log(environmentVariables[process.env.NODE_ENV]);
module.exports = environmentVariables[process.env.NODE_ENV];
