'use strict';

const printError = require('../error-handlers').printError;

module.exports = {
  up: (queryInterface, Sequelize) => {

    //Create users_questionnaire_info instead of delegates_questionnaire_info table
    const createTable = `CREATE TABLE IF NOT EXISTS users_questionnaire_info
    (   user_id int(10) unsigned NOT NULL DEFAULT '0',
        del int(10) unsigned NOT NULL DEFAULT '0',
        id_questionnaire int(10) unsigned NOT NULL DEFAULT '0',
        info text COLLATE 'latin1_swedish_ci' NOT NULL,
        createdAt datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT FK_UQInfoUser FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (id_questionnaire) REFERENCES questionnaires(id),
        PRIMARY KEY (user_id, id_questionnaire)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;`;

    //Fill table from delegates_questionnaire_info
    const fillTable = `INSERT INTO users_questionnaire_info (user_id, id_questionnaire, info, del)
        SELECT id_delegate, id_quest, info, id_delegate
        FROM delegates_questionnaire_info`;

    //Get all users ids by delegate_id

    const getUsersIds = `UPDATE users_questionnaire_info SET users_questionnaire_info.del =
        (SELECT IF(
          (SELECT deligates.user_id FROM deligates WHERE deligates.id = users_questionnaire_info.del) is null, DEFAULT(del),
          (SELECT deligates.user_id FROM deligates WHERE deligates.id = users_questionnaire_info.del)))`;

    //Delete all records with unexisting users
    const deleteUnexisting = `DELETE from users_questionnaire_info WHERE del=0;`;
    //Move all records from del to user_id column
    const fillIdUsers = `UPDATE users_questionnaire_info SET users_questionnaire_info.user_id = users_questionnaire_info.del`;
    //Remove del column
    const removeDel = `ALTER TABLE users_questionnaire_info DROP COLUMN del`;

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
      //return queryInterface.dropTable('users_questionnaire_info');
  }
};
