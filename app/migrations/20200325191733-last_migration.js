'use strict';

/**
 * Migration deletes all unneeded (after refactoring) tables and tables fields.
 */
module.exports = {
  up: (queryInterface, Sequelize) => {
    const dropTables = `DROP TABLE IF EXISTS
      delegates_questionnaire_attempt_limit,
      delegates_questionnaire_contact,
      delegates_questionnaire_info,
      deligates,
      multi_row_grids,
      nsp_normal_distribution;`;

    const dropUsersColumns = `ALTER TABLE users
        DROP COLUMN full_name,
        DROP COLUMN date_create,
        DROP COLUMN is_random_pass,
        DROP COLUMN login_history;`;

    const dropAttemptsColumns = `ALTER TABLE attempts
        DROP COLUMN deligate_id,
        DROP COLUMN tmp_start_time,
        DROP COLUMN tmp_sec_code,
        DROP COLUMN tmp_data;`;

    const dropQuestionnairesColumns = `ALTER TABLE questionnaires
        DROP COLUMN lang;`;

    const dropQuestionsColumns = `ALTER TABLE questions
        DROP COLUMN lang,
        DROP COLUMN qcategory;`;

    const dropCompaniesColumns = `ALTER TABLE companies
        DROP COLUMN pbo_emails,
        DROP COLUMN profile_id,
        DROP COLUMN post_profile_id;`;

    return queryInterface.sequelize.query('set FOREIGN_KEY_CHECKS=0')
        .then(() => queryInterface.sequelize.query(dropTables))
        .then(() => queryInterface.sequelize.query(dropUsersColumns))
        .then(() => queryInterface.sequelize.query(dropAttemptsColumns))
        .then(() => queryInterface.sequelize.query(dropQuestionnairesColumns))
        .then(() => queryInterface.sequelize.query(dropQuestionsColumns))
        .then(() => queryInterface.sequelize.query(dropCompaniesColumns))
        .then(() => queryInterface.sequelize.query('set FOREIGN_KEY_CHECKS=1'))
        .catch(function (err) {
          printError(err);
        });
  },

  down: (queryInterface, Sequelize) => {
  }
};
