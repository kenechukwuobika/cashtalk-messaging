'use strict';
const fs = require('fs');

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.
    */
    const preferenceData = JSON.parse(fs.readFileSync(`${__dirname}/data/permissionData.json`, 'utf-8'));
    return queryInterface.bulkInsert('preferences', preferenceData, {});
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.
    */

      return queryInterface.bulkDelete('preferences', null, {});
  }
};
