'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {

    const addForeignKey = `ALTER TABLE incompete_attempts ADD CONSTRAINT FK_IncompeteAttemptsQuestionnaires
                          FOREIGN KEY (questionnaire_id) REFERENCES questionnaires(id) ON DELETE CASCADE;`;
      return Promise.all([
        queryInterface.createTable('incompete_attempts', {
          id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
          },
          questionnaire_id: {
            type: Sequelize.INTEGER(10).UNSIGNED,
            allowNull: false,
            references: { model: 'questionnaires', key: 'id' }
          },
          status: { //(started = 1/completed = 2)
            type: Sequelize.INTEGER(3).UNSIGNED,
            allowNull: false,
            defaultValue: '1'
          },
          ip: {
            type: Sequelize.STRING(150),
            allowNull: false,
            defaultValue: ''
          },
          country: {
            type: Sequelize.STRING(150),
            allowNull: false,
            defaultValue: ''
          },
          state: {
            type: Sequelize.STRING(150),
            allowNull: false,
            defaultValue: ''
          },
          city: {
            type: Sequelize.STRING(150),
            allowNull: false,
            defaultValue: ''
          },
          browser: {
            type: Sequelize.STRING(150),
            allowNull: false,
            defaultValue: ''
          },
          responses: {
            type: Sequelize.INTEGER(10),
            allowNull: false,
            defaultValue: '0'
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
        }),
        queryInterface.sequelize.query(addForeignKey)
      ]);
  },

  down: (queryInterface, Sequelize) => {

  }
};
