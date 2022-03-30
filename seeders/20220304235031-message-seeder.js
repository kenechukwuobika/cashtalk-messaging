'use strict';
const fs = require('fs');

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.
    */
    const messagesData = JSON.parse(fs.readFileSync(`${__dirname}/messagesData.json`, 'utf-8'));
    return queryInterface.bulkInsert('Messages', messagesData, {});
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.
    */

      return queryInterface.bulkDelete('Messages', null, {});
  }
};
