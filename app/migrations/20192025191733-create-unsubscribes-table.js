'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {

      return Promise.all([
        queryInterface.createTable('unsubscribes', {
          id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
          },
          email: {
            type: Sequelize.STRING(150),
            allowNull: false,
            defaultValue: ''
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
         },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
         }
        })
      ]);
  },

  down: (queryInterface, Sequelize) => {

  }
};
