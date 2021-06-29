'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {

      return Promise.all([
        queryInterface.createTable('sim_keys', {
          id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
          },
          title: {
            type: Sequelize.STRING(512),
            allowNull: false
          },
          company_key: {
            type: Sequelize.STRING(512),
            allowNull: false
          },
          createdAt: Sequelize.DATE,
          updatedAt: Sequelize.DATE
        }),
        queryInterface.createTable('user_sim_key_maps', {
          user_id: {
            type: Sequelize.INTEGER(10).UNSIGNED,
            allowNull: false,
            primaryKey: true
          },
          sim_key_id: {
            type: Sequelize.INTEGER(10).UNSIGNED,
            allowNull: false,
            primaryKey: true
          },
          createdAt: Sequelize.DATE,
          updatedAt: Sequelize.DATE
        })
      ]);
  },

  down: (queryInterface, Sequelize) => {

  }
};
