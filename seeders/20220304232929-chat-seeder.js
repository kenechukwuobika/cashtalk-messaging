'use strict';
const fs = require('fs');

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.
    */
    const chatsData = JSON.parse(fs.readFileSync(`${__dirname}/chatsData.json`, 'utf-8'));
    return queryInterface.bulkInsert('chats', chatsData, {} );
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.
    */
    return queryInterface.bulkDelete('chats', null, {});
  }
};
