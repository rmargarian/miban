'use strict';

const printError = require('../error-handlers').printError;

/**
 * Migration creates 'users_questionnaire_contact' table equal to
 * 'delegates_questionnaire_contact' table except one change:
 * in 'users_questionnaire_contact' table 'id_delegate' replaced by 'used_id' column.
 * All data copied from 'delegates_questionnaire_contact' by 'id_delegate'
 * through 'delegates' table.
 */
module.exports = {
  up: (queryInterface, Sequelize) => {
    //Create users_questionnaire_contact instead of delegates_questionnaire_contact table
    const createTable = `CREATE TABLE IF NOT EXISTS users_questionnaire_contact
    (   user_id int(10) unsigned NOT NULL DEFAULT '0',
        del int(10) unsigned NOT NULL DEFAULT '0',
        id_questionnaire int(10) unsigned NOT NULL DEFAULT '0',
        contact char(1) COLLATE 'utf8_general_ci' NOT NULL DEFAULT '1',
        createdAt datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT FK_UQContactUser FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (id_questionnaire) REFERENCES questionnaires(id),
        PRIMARY KEY (user_id, id_questionnaire)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;`;

    //Fill table from delegates_questionnaire_contact
    const fillTable = `INSERT INTO users_questionnaire_contact (user_id, id_questionnaire, contact, del)
        SELECT id_delegate, id_questionnaire, contact, id_delegate
        FROM delegates_questionnaire_contact`;

    //Get all users ids by delegate_id
    const getUsersIds =
    `UPDATE users_questionnaire_contact SET users_questionnaire_contact.del = (SELECT IF(
      (SELECT deligates.user_id FROM deligates WHERE deligates.id = users_questionnaire_contact.del) is null, DEFAULT(del),
      (SELECT deligates.user_id FROM deligates WHERE deligates.id = users_questionnaire_contact.del)))`;

    //Delete all records with unexisting users
    const deleteUnexisting = `DELETE from users_questionnaire_contact WHERE del=0;`;
    //Move all records from del to user_id column
    const fillIdUsers = `UPDATE users_questionnaire_contact SET users_questionnaire_contact.user_id = users_questionnaire_contact.del`;
    //Remove del column
    const removeDel = `ALTER TABLE users_questionnaire_contact DROP COLUMN del`;

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
      //return queryInterface.dropTable('users_questionnaire_contact');
  }
};
