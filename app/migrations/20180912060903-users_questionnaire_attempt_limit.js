'use strict';

const printError = require('../error-handlers').printError;

module.exports = {
  up: (queryInterface, Sequelize) => {

    //Create users_questionnaire_attempt_limit instead of delegates_questionnaire_attempt_limit table
    const createTable = `CREATE TABLE IF NOT EXISTS users_questionnaire_attempt_limit
    (   user_id int(10) unsigned NOT NULL DEFAULT '0',
        del int(10) unsigned NOT NULL DEFAULT '0',
        id_questionnaire int(10) unsigned NOT NULL DEFAULT '0',
        attempts_limit int(1) DEFAULT '1',
        report_completion int(1) DEFAULT '1',
        createdAt datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT FK_UQAttemptLimitUser FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (id_questionnaire) REFERENCES questionnaires(id),
        PRIMARY KEY (user_id, id_questionnaire)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;`;

    //Fill table from delegates_questionnaire_attempt_limit
    const fillTable = `INSERT INTO users_questionnaire_attempt_limit (user_id, id_questionnaire, attempts_limit, report_completion, del)
        SELECT delegate_id, questionnaire_id, attempts_limit, report_completion, delegate_id
        FROM delegates_questionnaire_attempt_limit`;

    //Get all users ids by delegate_id
    const getUsersIds =  `UPDATE users_questionnaire_attempt_limit SET users_questionnaire_attempt_limit.del =
        (SELECT IF(
          (SELECT deligates.user_id FROM deligates WHERE deligates.id = users_questionnaire_attempt_limit.del) is null, DEFAULT(del),
          (SELECT deligates.user_id FROM deligates WHERE deligates.id = users_questionnaire_attempt_limit.del)))`;

    //Delete all records with unexisting users
    const deleteUnexisting = `DELETE from users_questionnaire_attempt_limit WHERE del=0;`;
    //Move all records from del to user_id column
    const fillIdUsers = `UPDATE users_questionnaire_attempt_limit SET users_questionnaire_attempt_limit.user_id = users_questionnaire_attempt_limit.del`;
    //Remove del column
    const removeDel = `ALTER TABLE users_questionnaire_attempt_limit DROP COLUMN del`;

    return queryInterface.sequelize.query(createTable)
      .then(() => queryInterface.sequelize.query('set FOREIGN_KEY_CHECKS=0'))
      .then(() => queryInterface.sequelize.query(fillTable))
      .then(() => queryInterface.sequelize.query(getUsersIds))
      .then(() => queryInterface.sequelize.query(deleteUnexisting))
      .then(() => queryInterface.sequelize.query(fillIdUsers))
      .then(() => queryInterface.sequelize.query(removeDel))
      .then(() => queryInterface.sequelize.query('set FOREIGN_KEY_CHECKS=1'))
      .catch(function (err) {
        printError(err);
      });
  },

  down: (queryInterface, Sequelize) => {
      //return queryInterface.dropTable('users_questionnaire_attempt_limit');
  }
};
