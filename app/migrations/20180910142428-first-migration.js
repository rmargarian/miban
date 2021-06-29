'use strict';

const fs = require('fs');
const printError = require('../error-handlers').printError;

/**
 * Migration executes following:
 * 1) reads 'ne2_profiles.sql' dump file (located in root folder),
 * 2) replaces 'MyISAM' to 'InnoDB' engine,
 * 3) adds 'createdAt' and 'updatedAt' to each table,
 * 4) exequtes all queries from dump file (creates and fills tables),
 * 5) drops 'word_map' table
 */
module.exports = {
  up: (queryInterface, Sequelize) => {
    const queries = fs.readFileSync(__dirname + '/../../ne2_profiles.sql', {
      encoding: 'UTF-8'
    }).split(';\n');

    // Setup the DB to import data in bulk.
    let promise = queryInterface.sequelize.query('set FOREIGN_KEY_CHECKS=0').then(() => {
      return queryInterface.sequelize.query('set UNIQUE_CHECKS=0');
    }).then(() => {
      return queryInterface.sequelize.query(`set SQL_MODE='NO_AUTO_VALUE_ON_ZERO'`);
    }).then(() => {
      return queryInterface.sequelize.query('set SQL_NOTES=0');
    });

    for (let query of queries) {
      query = query.trim();
      if (query.length !== 0 && !query.match(/\/\*/)) {
        promise = promise.then(() => {
          console.log('*****************Executing: ' + query.substring(0, 100));
          query = query.replace('MyISAM', 'InnoDB');
          const addDateFields =
            `\`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY`;
          query = query.replace('PRIMARY KEY', addDateFields);
          return queryInterface.sequelize.query(query, {raw: true});
        })
      }
    }
    return promise.then(() => {
      console.timeEnd('Importing mysql dump');
    }).then(() => {
      return queryInterface.sequelize.query('DROP TABLE IF EXISTS word_map;');
    }).then(() => {
      console.timeEnd('First migration finished');
    }).catch(function (err) {
      printError(err);
    });
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.showAllTables().then(function (tableNames) {
      // Don't drop the SequelizeMeta table
      const tables = tableNames.filter(function (name) {
        return name.toLowerCase() !== 'sequelizemeta';
      });

      const migrations = [];
      migrations.push(queryInterface.sequelize.query('set FOREIGN_KEY_CHECKS=0'));
      for (let tableName of tables) {
        migrations.push(queryInterface.dropTable(tableName));
      }
      return Promise.all(migrations).catch(function (err) {
        printError(err);
      });
    });
  }
};
