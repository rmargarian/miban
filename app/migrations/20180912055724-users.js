'use strict';

const printError = require('../error-handlers').printError;

/**
 * Migration Moves all data from 'delegates' to 'users' table
 * by 'user_id' field in 'delegates' table.
 * After migration following columns will be added to 'users' table:
 * - Copied from 'delegates' table:
 *  'company_id', 'first_name', 'p_date', 'p_location', 'last_attempt', 'tick'
 * - Added by new requirments:
 *  'p_date2', 'p_groups', 'p_saved', 'ip', 'last_location'
 */
module.exports = {
  up: (queryInterface, Sequelize) => {

    const addColumnCompanyId = `ALTER TABLE users ADD COLUMN company_id int(10) unsigned NOT NULL AFTER id;`;
    const addForeignKey = `ALTER TABLE users ADD CONSTRAINT FK_UserCompany FOREIGN KEY (company_id) REFERENCES companies(id);`;
    const fillColumnCompanyId = `UPDATE users SET users.company_id = (SELECT IF(
      (SELECT deligates.company_id FROM deligates WHERE deligates.user_id = users.id) is null, 0,
      (SELECT deligates.company_id FROM deligates WHERE deligates.user_id = users.id)))
       WHERE users.id = users.id; `;

    const addColumnFirstName = `ALTER TABLE users ADD COLUMN first_name varchar(512) COLLATE 'utf8_general_ci' NOT NULL AFTER full_name;`;
    const updateUsersFirstName = `UPDATE users SET users.first_name = users.full_name;`;

    const updateDeligatesPDate = `UPDATE deligates SET deligates.p_date = NULL WHERE CAST(deligates.p_date AS CHAR(20)) = CURRENT_TIMESTAMP;`;
    const addColumnPDate = `ALTER TABLE users ADD COLUMN p_date datetime DEFAULT NULL AFTER notes;`;
    const fillColumnPDate = `UPDATE users SET users.p_date = (SELECT IF(
      (SELECT deligates.p_date FROM deligates WHERE deligates.user_id = users.id) is null, DEFAULT(p_date),
      (SELECT deligates.p_date FROM deligates WHERE deligates.user_id = users.id)))
       WHERE users.id = users.id; `;

    const addColumnPDate2 = `ALTER TABLE users ADD COLUMN p_date2 datetime DEFAULT NULL AFTER p_date;`;

    const addColumnPLocation = `ALTER TABLE users ADD COLUMN p_location varchar(150) COLLATE 'utf8_general_ci' DEFAULT '' AFTER p_date2;`;
    const fillColumnPLocation = `UPDATE users SET users.p_location = (SELECT IF(
      (SELECT deligates.p_location FROM deligates WHERE deligates.user_id = users.id) is null, DEFAULT(p_location),
      (SELECT deligates.p_location FROM deligates WHERE deligates.user_id = users.id)))
       WHERE users.id = users.id; `;

    const addColumnPGroups = `ALTER TABLE users ADD COLUMN p_groups varchar(150) COLLATE 'utf8_general_ci' DEFAULT '' AFTER p_location;`;
    const addColumnPSaved = `ALTER TABLE users ADD COLUMN p_saved varchar(150) COLLATE 'utf8_general_ci' DEFAULT '' AFTER p_groups;`;
    const addColumnIp = `ALTER TABLE users ADD COLUMN ip varchar(150) COLLATE 'utf8_general_ci' DEFAULT '' AFTER p_saved;`;
    const addColumnLastLocation = `ALTER TABLE users ADD COLUMN last_location varchar(150) COLLATE 'utf8_general_ci' DEFAULT '' AFTER ip;`;

    const updateDeligatesLastAttempt = `UPDATE deligates SET deligates.last_attempt = NULL WHERE CAST(deligates.last_attempt AS CHAR(20)) = CURRENT_TIMESTAMP;`;
    const addColumnLastAttempt = `ALTER TABLE users ADD COLUMN last_attempt datetime DEFAULT NULL AFTER last_location;`;
    const fillColumnLastAttempt = `UPDATE users SET users.last_attempt = (SELECT IF(
      (SELECT deligates.last_attempt FROM deligates WHERE deligates.user_id = users.id) is null, DEFAULT(last_attempt),
      (SELECT deligates.last_attempt FROM deligates WHERE deligates.user_id = users.id)))
       WHERE users.id = users.id; `;

    return queryInterface.sequelize.query('set FOREIGN_KEY_CHECKS=0')
    .then(() => queryInterface.sequelize.query(addColumnCompanyId))
    .then(() => queryInterface.sequelize.query(addForeignKey))
    .then(() => queryInterface.sequelize.query(fillColumnCompanyId))

    .then(() => queryInterface.sequelize.query(addColumnFirstName))
    .then(() => queryInterface.sequelize.query(updateUsersFirstName))

    .then(() => queryInterface.sequelize.query(updateDeligatesPDate))
    .then(() => queryInterface.sequelize.query(addColumnPDate))
    .then(() => queryInterface.sequelize.query(fillColumnPDate))

    .then(() => queryInterface.sequelize.query(addColumnPDate2))

    .then(() => queryInterface.sequelize.query(addColumnPLocation))
    .then(() => queryInterface.sequelize.query(fillColumnPLocation))

    .then(() => queryInterface.sequelize.query(addColumnPGroups))
    .then(() => queryInterface.sequelize.query(addColumnPSaved))
    .then(() => queryInterface.sequelize.query(addColumnIp))
    .then(() => queryInterface.sequelize.query(addColumnLastLocation))

    .then(() => queryInterface.sequelize.query(updateDeligatesLastAttempt))
    .then(() => queryInterface.sequelize.query(addColumnLastAttempt))
    .then(() => queryInterface.sequelize.query(fillColumnLastAttempt))
    .then(() => queryInterface.sequelize.query('set FOREIGN_KEY_CHECKS=1'))
    .catch(function (err) {
      printError(err);
    });
  },

  down: (queryInterface, Sequelize) => {
    /*return queryInterface.sequelize.query('set FOREIGN_KEY_CHECKS=0')
    .then(() => queryInterface.sequelize.query('ALTER TABLE users DROP FOREIGN KEY FK_UserCompany'))
    .then(() => queryInterface.sequelize.query('ALTER TABLE users DROP COLUMN company_id'))
    .then(() => queryInterface.sequelize.query('ALTER TABLE users DROP COLUMN first_name'))
    .then(() => queryInterface.sequelize.query('ALTER TABLE users DROP COLUMN p_date'))
    .then(() => queryInterface.sequelize.query('ALTER TABLE users DROP COLUMN p_location'))
    .then(() => queryInterface.sequelize.query('ALTER TABLE users DROP COLUMN last_attempt'))
    .then(() => queryInterface.sequelize.query('ALTER TABLE users DROP COLUMN tick'))
    .then(() => queryInterface.sequelize.query('set FOREIGN_KEY_CHECKS=1'))
    .catch(function (err) {
      printError(err);
    });*/
  }
};
