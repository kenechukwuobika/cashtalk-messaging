'use strict';
const fs = require('fs');

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.
    */
    const profileData = JSON.parse(fs.readFileSync(`${__dirname}/data/profileData.json`, 'utf-8'));
    return queryInterface.bulkInsert('profiles', profileData, {});
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.
    */

      return queryInterface.bulkDelete('profiles', null, {});
  }
};
