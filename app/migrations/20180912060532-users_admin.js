'use strict';

const printError = require('../error-handlers').printError;

module.exports = {
  up: (queryInterface, Sequelize) => {

    const dropUsersAdminColumns =
      `ALTER TABLE users_admin
        DROP COLUMN email2,
        DROP COLUMN username_canonical,
        DROP COLUMN currency_country,
        DROP COLUMN password_requested_at,
        DROP COLUMN expires_at,
        DROP COLUMN expired,
        DROP COLUMN locked,
        DROP COLUMN email_canonical;`;
    const changeUsersAdminColumns =
      `ALTER TABLE users_admin
        CHANGE COLUMN confirmation_token password_change_token VARCHAR(255) DEFAULT '',
        CHANGE COLUMN default_currency currency_country SMALLINT(5) UNSIGNED NOT NULL DEFAULT 145,
        CHANGE COLUMN credentials_expired credentials_expired TINYINT(1),
        ADD COLUMN password_change_token_date_expiration DATETIME AFTER password_change_token;`;

    return queryInterface.sequelize.query(dropUsersAdminColumns)
      .then(() => queryInterface.sequelize.query(changeUsersAdminColumns))
      .catch(function (err) {
        printError(err);
      });
  },

  down: (queryInterface, Sequelize) => {
    /*const revertUsersAdminColumns =
      `ALTER TABLE users_admin
        CHANGE COLUMN password_change_token confirmation_token VARCHAR(255) NOT NULL DEFAULT '',
        CHANGE COLUMN currency_country default_currency SMALLINT(5) UNSIGNED NOT NULL DEFAULT '145',
        DROP COLUMN password_change_token_date_expiration`;
    const addUsersAdminColumns =
      `ALTER TABLE users_admin
        ADD COLUMN email2 VARCHAR(1),
        ADD COLUMN username_canonical VARCHAR(1),
        ADD COLUMN currency_country VARCHAR(1),
        ADD COLUMN password_requested_at VARCHAR(1),
        ADD COLUMN expires_at VARCHAR(1),
        ADD COLUMN expired VARCHAR(1),
        ADD COLUMN locked VARCHAR(1),
        ADD COLUMN email_canonical VARCHAR(1);`;
    return queryInterface.sequelize.query(revertUsersAdminColumns)
    .then(() => queryInterface.sequelize.query(addUsersAdminColumns))
    .catch(function (err) {
      printError(err);
    });*/
  }
};
