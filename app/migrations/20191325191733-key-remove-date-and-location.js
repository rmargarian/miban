'use strict';

/**
 * Migration deletes date, location and all related fields from 'companies' table
 */
module.exports = {
  up: (queryInterface, Sequelize) => {
    const dropCompaniesColumns = `ALTER TABLE companies
        DROP COLUMN location,
        DROP COLUMN date,
        DROP COLUMN show_location,
        DROP COLUMN show_date,
        DROP COLUMN edit_location,
        DROP COLUMN edit_date,
        DROP COLUMN mn_location,
        DROP COLUMN mn_date;`

    return queryInterface.sequelize.query('set FOREIGN_KEY_CHECKS=0')
        .then(() => queryInterface.sequelize.query(dropCompaniesColumns))
        .then(() => queryInterface.sequelize.query('set FOREIGN_KEY_CHECKS=1'))
        .catch(function (err) {
          printError(err);
        });
  },

  down: (queryInterface, Sequelize) => {
  }
};
