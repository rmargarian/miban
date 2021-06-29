'use strict';

const printError = require('../error-handlers').printError;
const models = require('../models');
/**
 * Migration sets users password with null values to empty string
 */
module.exports = {
  up: (queryInterface, Sequelize) => {
    const query = { passwd: '' };
    return models.User.update(query, {
      where: {
        passwd: null
      }
    })
      .catch(function (err) {
        printError(err);
      });
  },

  down: (queryInterface, Sequelize) => {
  }
};
