'use strict';

const printError = require('../error-handlers').printError;
const models = require('../models');

/**
 * Migration to fix QuestionAnswerOption table set of options with order_pos === 0
 * @type {{up: (function(*, *): Promise<string>), down: module.exports.down}}
 */
module.exports = {
  up: (queryInterface, Sequelize) => {
    let updatePromises = [];

    return models.Question.findAll({
      attributes: ['id'],
      include: [
        {model: models.QuestionAnswerOption, as: 'question_answer_options', attributes: ['id', 'order_pos']}
      ]
    }).then(questions => {
      questions.forEach(question => {
        let answerOptions = question.question_answer_options;

        /**
         * Check each Question QuestionAnswerOptions and if there are any and they length is more then 1,
         * check if last option order_pos is equal to 0. In this case set order_pos manually from options index in db
         */
        if(answerOptions && answerOptions.length > 1 && answerOptions[answerOptions.length - 1].order_pos === 0) {
          answerOptions.forEach((answer, index) => {
            updatePromises.push(answer.update({order_pos: index + 1}));
          });
        }
      });

      return Promise.all(updatePromises);
    }).then(() => {
      return 'done';
    }).catch(err => {
      printError(err);
    });
  },
  down: (queryInterface, Sequelize) => {
  }
};
