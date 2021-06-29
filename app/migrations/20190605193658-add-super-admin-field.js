'use strict';

const printError = require('../error-handlers').printError;
const models = require('../models');

module.exports = {
  up: (queryInterface, Sequelize) => {
    const addSuperAdmin =
      `ALTER TABLE users_admin
        ADD COLUMN is_super SMALLINT(1) NULL DEFAULT 0 AFTER username;`;

    return queryInterface.sequelize.query(addSuperAdmin)
    .then(() => {
      const query = {is_super: 1};
      return models.UserAdmin.update(query, { where: {
        username: {
          [Sequelize.Op.or]: ['calum', 'erich']
        }}
      });
    })
    .catch(function (err) {
      printError(err);
    });
  },

  down: (queryInterface, Sequelize) => {
  }
};
