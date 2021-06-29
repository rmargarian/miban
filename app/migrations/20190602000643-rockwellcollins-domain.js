'use strict';

const printError = require('../error-handlers').printError;

/**
 * Change all PFA emails that end in domain: rockwellcollins.com to instead end in collins.com
 */
module.exports = {
  up: (queryInterface, Sequelize) => {
    const updateUsers = `
      UPDATE   users
      SET      email = CONCAT(LEFT(email, INSTR(email, '@')), 'collins.com')
      WHERE    email LIKE '%rockwellcollins.com%';
    `;
    const updateCompanies = `
      UPDATE   companies
      SET      email = CONCAT(LEFT(email, INSTR(email, '@')), 'collins.com')
      WHERE    email LIKE '%rockwellcollins.com%';
    `;

    return queryInterface.sequelize.query(updateUsers)
      .then(() => {
        return queryInterface.sequelize.query(updateCompanies);
      })
      .catch(function (err) {
        printError(err);
      });
  },

  down: (queryInterface, Sequelize) => {

  }
};
