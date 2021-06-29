'use strict';

const printError = require('../error-handlers').printError;

module.exports = {
  up: (queryInterface, Sequelize) => {
    const deleteParticipants = `
      DELETE FROM users
      WHERE NOT EXISTS(SELECT NULL
            FROM companies c
            WHERE c.id = company_id)
    `;

    return queryInterface.sequelize.query('set FOREIGN_KEY_CHECKS=0')
    .then(() => {return queryInterface.sequelize.query(deleteParticipants);})
    .then((resp) => {
      console.log(resp);
      queryInterface.sequelize.query('set FOREIGN_KEY_CHECKS=1');
    })
      .catch(function (err) {
        printError(err);
      });
  },
  down: (queryInterface, Sequelize) => {
  }
};
