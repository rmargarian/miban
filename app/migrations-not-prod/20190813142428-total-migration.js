'use strict';

const fs = require('fs');
const printError = require('../error-handlers').printError;

/**
 * Migration for all envs but 'production'
 * Reads 'ne2_profiles.sql' dump file (located in root folder)
 * Dump file exported from PFA live ('production')
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
      if (query.length !== 0 && !query.match(/\/\*/)
        && !query.includes('`SequelizeMeta`')
        ) {
        promise = promise.then(() => {
          console.log('*****************Executing: ' + query.substring(0, 100));
          return queryInterface.sequelize.query(query, {raw: true});
        });
      }
    }
    return promise.then(() => {
      console.timeEnd('Importing mysql dump');
    }).then(() => {
      console.timeEnd('Total migration finished');
    }).catch(function (err) {
      printError(err);
    });
  },

  down: (queryInterface, Sequelize) => {
  }
};
