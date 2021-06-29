'use strict';

const printError = require('../error-handlers').printError;

module.exports = {
  up: (queryInterface, Sequelize) => {
    const addColumnIsSortHide = `ALTER TABLE questions ADD COLUMN is_sort_hide  SMALLINT(1) NULL DEFAULT 0 AFTER is_faces;`;

    return queryInterface.sequelize.query('set FOREIGN_KEY_CHECKS=0')
    .then(() => queryInterface.sequelize.query(addColumnIsSortHide))
    .then(() => queryInterface.sequelize.query('set FOREIGN_KEY_CHECKS=1'))
      .catch(function (err) {
        printError(err);
      });
  },
  down: (queryInterface, Sequelize) => {
  }
};
