'use strict';

const printError = require('../error-handlers').printError;

module.exports = {
  up: (queryInterface, Sequelize) => {
    const addColumnIsFaces = `ALTER TABLE questions ADD COLUMN is_faces SMALLINT(1) NULL DEFAULT 0 AFTER is_cloud;`;
    const addColumnFaceType = `ALTER TABLE question_answer_options ADD COLUMN face_type SMALLINT(1) NULL DEFAULT 0 AFTER score;`;

    return queryInterface.sequelize.query('set FOREIGN_KEY_CHECKS=0')
    .then(() => queryInterface.sequelize.query(addColumnIsFaces))
    .then(() => queryInterface.sequelize.query(addColumnFaceType))
    .then(() => queryInterface.sequelize.query('set FOREIGN_KEY_CHECKS=1'))
      .catch(function (err) {
        printError(err);
      });
  },
  down: (queryInterface, Sequelize) => {
  }
};
