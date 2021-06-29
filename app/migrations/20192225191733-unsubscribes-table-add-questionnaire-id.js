'use strict';

const printError = require('../error-handlers').printError;

/**
 * Migration adds 'questionnaire_id' column into the 'unsubscribes' table
 */
module.exports = {
  up: (queryInterface, Sequelize) => {
    const addColumnQuestionnaireId = `ALTER TABLE unsubscribes ADD COLUMN questionnaire_id int(10) unsigned NOT NULL AFTER id;`;
    const addForeignKey = `ALTER TABLE unsubscribes ADD CONSTRAINT FK_UnsubscribesQuestionnaire
                          FOREIGN KEY (questionnaire_id) REFERENCES questionnaires(id) ON DELETE CASCADE;`;

    return queryInterface.sequelize.query('set FOREIGN_KEY_CHECKS=0')
      .then(() => queryInterface.sequelize.query(addColumnQuestionnaireId))
      .then(() => queryInterface.sequelize.query(addForeignKey))
      .then(() => queryInterface.sequelize.query('set FOREIGN_KEY_CHECKS=1'))
      .catch(function (err) {
        printError(err);
      });
  },

  down: (queryInterface, Sequelize) => {
  }
};
