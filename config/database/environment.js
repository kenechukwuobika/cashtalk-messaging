const dotenv = require("dotenv").config();
const fs = require("fs");

const environmentVariables = {
  development: {
    host: process.env.DEV_DB_HOST,
    database: process.env.DEV_DB_NAME,
    username: process.env.DEV_DB_USERNAME,
    password: process.env.DEV_DB_PASSWORD,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    secret: process.env.DB_SECRET,
    seederStorage: process.env.DB_SEEDER_STORAGE,
    dialectOptions: {}
  },
  production: {
    host: process.env.PROD_DB_HOST,
    database: process.env.PROD_DB_NAME,
    username: process.env.PROD_DB_USERNAME,
    password: process.env.PROD_DB_PASSWORD,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    dialectOptions: {
      ssl: {
        "require": true,
        "rejectUnauthorized": false
      }
    },
    secret: process.env.DB_SECRET,
    seederStorage: process.env.DB_SEEDER_STORAGE
  }
};
console.log(environmentVariables[process.env.NODE_ENV])
module.exports = environmentVariables[process.env.NODE_ENV];
