'use strict';

const printError = require('../error-handlers').printError;
/**
 * Migration adds new fields into the 'users' table:
 * organization, phone, phone_code, isp
 */
module.exports = {
  up: (queryInterface, Sequelize) => {
    const addUsersColumns =
      `ALTER TABLE users
        ADD COLUMN organization VARCHAR(150) DEFAULT '',
        ADD COLUMN phone VARCHAR(20) DEFAULT '',
        ADD COLUMN phone_code VARCHAR(10) DEFAULT '',
        ADD COLUMN phone_iso2 VARCHAR(10) DEFAULT '',
        ADD COLUMN isp VARCHAR(150) DEFAULT '';`;
        return queryInterface.sequelize.query(addUsersColumns)
        .catch(function (err) {
          printError(err);
        });
  },

  down: (queryInterface, Sequelize) => {
  }
};
