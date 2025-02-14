'use strict';
const fs = require('fs');

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.
    */
    const messageData = JSON.parse(fs.readFileSync(`${__dirname}/data/messageData.json`, 'utf-8'));
    return queryInterface.bulkInsert('messages', messageData, {});
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.
    */

      return queryInterface.bulkDelete('messages', null, {});
  }
};
