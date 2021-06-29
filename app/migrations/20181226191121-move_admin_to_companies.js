'use strict';

const printError = require('../error-handlers').printError;
const models = require('../models');

/**
 * Migration moves 'admin' and 'admin_email' columns
 * from 'questionnaires' to 'companies' table.
 * And initialize existing companies:
 * - admin = 'Calum Coburn',
 * - admin_email = 'calum.coburn@negotiations.com'
 */
module.exports = {
  up: (queryInterface, Sequelize) => {
    const addColumnAdministrator = `ALTER TABLE companies ADD COLUMN admin VARCHAR(200) NULL AFTER email;`;
    const addColumnAdminEmail = `ALTER TABLE companies ADD COLUMN admin_email VARCHAR(200) NULL AFTER admin;`;
    const setAdminValue = `update companies set admin = 'Calum Coburn'`;
    const setAdminEmailValue = `update companies set admin_email = 'calum.coburn@negotiations.com'`;

    const dropQuestionnaireAdmin = 'ALTER TABLE questionnaires DROP COLUMN admin';
    const dropQuestionnaireAdminEmail = 'ALTER TABLE questionnaires DROP COLUMN admin_email';

    return queryInterface.sequelize.query(addColumnAdministrator)
      .then(() => {
        return queryInterface.sequelize.query(addColumnAdminEmail);
      })
      .then(() => {
        return queryInterface.sequelize.query(setAdminValue);
      })
      .then(() => {
        return queryInterface.sequelize.query(setAdminEmailValue);
      })
      .then(() => {
        return queryInterface.sequelize.query(dropQuestionnaireAdmin);
      })
      .then(() => {
        return queryInterface.sequelize.query(dropQuestionnaireAdminEmail);
      })
      .then(() => {
        const query = {admin: 'Erich Rifenburgh', admin_email: 'erich.rifenburgh@negotiations.com'};
        return models.Company.update(query, { where: { email: 'erich.rifenburgh@negotiations.com'} });
      })
      .catch(function (err) {
        printError(err);
      });
  },
  down: (queryInterface, Sequelize) => {
   /* return queryInterface.sequelize.query('ALTER TABLE companies DROP COLUMN admin')
      .then(() => {
        return queryInterface.sequelize.query('ALTER TABLE companies DROP COLUMN admin_email');
      })
      .then(() => {
        return queryInterface.sequelize.query('ALTER TABLE questionnaires ADD COLUMN admin VARCHAR(200) NULL;');
      })
      .then(() => {
        return queryInterface.sequelize.query('ALTER TABLE questionnaires ADD COLUMN admin_email VARCHAR(200) NULL;');
      })
      .catch(function (err) {
        printError(err);
      });*/
  }
};
