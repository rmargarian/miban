'use strict';

const printError = require('../error-handlers').printError;

module.exports = {
  up: (queryInterface, Sequelize) => {
    const addColumnDeleted = `ALTER TABLE questions ADD COLUMN deleted SMALLINT(1) NULL DEFAULT 0 AFTER show_tooltips;`;
    const addColumnIsCloud = `ALTER TABLE questions ADD COLUMN is_cloud SMALLINT(1) NULL DEFAULT 0 AFTER is_bonus;`;
    const addFK_QAOptionQuestion = `ALTER TABLE question_answer_options ADD CONSTRAINT FK_QAOptionQuestion
                          FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE;`;
    const addFK_QGroupQmapQuestion = `ALTER TABLE question_groups_questions_maps ADD CONSTRAINT FK_QGroupQmapQuestion
                          FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE;`;
    const addFK_QGroupQmapQuestionGroup = `ALTER TABLE question_groups_questions_maps ADD CONSTRAINT FK_QGroupQmapQuestionGroup
                          FOREIGN KEY (question_group_id) REFERENCES question_groups(id) ON DELETE CASCADE;`;
    const addFK_SliderTagQuestion = `ALTER TABLE sliders_tags ADD CONSTRAINT FK_SliderTagQuestion
                          FOREIGN KEY (id_question) REFERENCES questions(id) ON DELETE CASCADE;`;

    return queryInterface.sequelize.query('set FOREIGN_KEY_CHECKS=0')
    .then(() => queryInterface.sequelize.query(addColumnDeleted))
    .then(() => queryInterface.sequelize.query(addColumnIsCloud))
    .then(() => queryInterface.sequelize.query(addFK_QAOptionQuestion))
    .then(() => queryInterface.sequelize.query(addFK_QGroupQmapQuestion))
    .then(() => queryInterface.sequelize.query(addFK_QGroupQmapQuestionGroup))
    .then(() => queryInterface.sequelize.query(addFK_SliderTagQuestion))
    .then(() => queryInterface.sequelize.query('set FOREIGN_KEY_CHECKS=1'))
      .catch(function (err) {
        printError(err);
      });
  },
  down: (queryInterface, Sequelize) => {
    /*return queryInterface.sequelize.query('ALTER TABLE questions DROP COLUMN deleted')
      .catch(function (err) {
        printError(err);
      });*/
  }
};
