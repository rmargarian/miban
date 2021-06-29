'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    const selectSameEmails =
      `SELECT id, email, last_attempt
  FROM users WHERE
  email
  in (SELECT email
  FROM users GROUP BY
  email HAVING COUNT(*)>1) order by email, last_attempt;`;
    return queryInterface.sequelize.query(selectSameEmails).then((rows) => {
      for (let i = 0; i < rows[0].length; i += 2) {
        const editEmailAddressesWithOldAttempts = `update users set email = CONCAT(email, 1) where id = ` + rows[0][i].id + `;`;
        queryInterface.sequelize.query(editEmailAddressesWithOldAttempts);
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return null;
  }
};
