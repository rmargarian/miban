'use strict';

const printError = require('../error-handlers').printError;

module.exports = {
  up: (queryInterface, Sequelize) => {
    const addFK_UserAnswers_Attempt = `ALTER TABLE user_answers ADD CONSTRAINT FK_UserAnswers_Attempt
                          FOREIGN KEY (attempt_id) REFERENCES attempts(id) ON DELETE CASCADE;`;
    const addFK_UserAnswerOptions_UserAnswer = `ALTER TABLE user_answer_options ADD CONSTRAINT FK_UserAnswerOptions_UserAnswer
                          FOREIGN KEY (answer_id) REFERENCES user_answers(id) ON DELETE CASCADE;`;

    return queryInterface.sequelize.query('set FOREIGN_KEY_CHECKS=0')
    .then(() => queryInterface.sequelize.query(addFK_UserAnswers_Attempt))
    .then(() => queryInterface.sequelize.query(addFK_UserAnswerOptions_UserAnswer))
    .then(() => queryInterface.sequelize.query('set FOREIGN_KEY_CHECKS=1'))
    .catch(function (err) {
      printError(err);
    });
  },
  down: (queryInterface, Sequelize) => {
  }
};
