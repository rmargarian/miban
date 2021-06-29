'use strict';

const printError = require('../error-handlers').printError;

/**
 * Migration creates 'user_id' column and fills its values by 'deligate_id' field
 */
module.exports = {
  up: (queryInterface, Sequelize) => {
    const addColumnUserId = `ALTER TABLE attempts ADD COLUMN user_id int(10) unsigned NOT NULL AFTER id;`;
    const addForeignKey = `ALTER TABLE attempts ADD CONSTRAINT FK_AttemptUser
                          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;`;
    const fillColumnUserId = `UPDATE attempts SET attempts.user_id = (SELECT IF(
      (SELECT deligates.user_id FROM deligates WHERE deligates.id = attempts.deligate_id) is null, DEFAULT(attempts.id),
      (SELECT deligates.user_id FROM deligates WHERE deligates.id = attempts.deligate_id)))
       WHERE attempts.deligate_id = attempts.deligate_id; `;

    return queryInterface.sequelize.query('set FOREIGN_KEY_CHECKS=0')
      .then(() => queryInterface.sequelize.query(addColumnUserId))
      .then(() => queryInterface.sequelize.query(addForeignKey))
      .then(() => queryInterface.sequelize.query(fillColumnUserId))
      .then(() => queryInterface.sequelize.query('set FOREIGN_KEY_CHECKS=1'))
      .catch(function (err) {
        printError(err);
      });
  },

  down: (queryInterface, Sequelize) => {
    /*return queryInterface.sequelize.query('set FOREIGN_KEY_CHECKS=0')
    .then(() => queryInterface.sequelize.query(`ALTER TABLE attempts
      DROP FOREIGN KEY FK_AttemptUser,
      DROP COLUMN user_id`))
    .then(() => queryInterface.sequelize.query('set FOREIGN_KEY_CHECKS=1'))
    .catch(function (err) {
      printError(err);
    });*/
  }
};
