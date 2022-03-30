const dotenv = require("dotenv").config();
const fs = require("fs");

const environmentVariables = {
  development: {
    host: process.env.DEV_HOST,
    database: process.env.DEV_DATABASE,
    username: process.env.DEV_DB_USERNAME,
    password: process.env.DEV_PASSWORD,
    port: process.env.DEV_DB_PORT,
    dialect: process.env.DIALECT,
    secret: process.env.SECRET,
    seederStorage: process.env.SEEDER_STORAGE
  },
  production: {
    host: process.env.PROD_HOSTNAME,
    database: process.env.PROD_DB_NAME,
    username: process.env.PROD_USERNAME,
    password: process.env.PROD_PASSWORD,
    port: process.env.PROD_PORT,
    dialect: process.env.DIALECT,
    secret: process.env.SECRET,
    seederStorage: process.env.SEEDER_STORAGE
  }
};
module.exports = environmentVariables[process.env.NODE_ENV];
