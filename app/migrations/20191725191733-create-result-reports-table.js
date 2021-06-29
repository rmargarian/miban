'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {

    const addForeignKey = `ALTER TABLE result_reports ADD CONSTRAINT FK_ResultReportsUser
                          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;`;
      return Promise.all([
        queryInterface.createTable('result_reports', {
          id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
          },
          user_id: {
            type: Sequelize.INTEGER(10).UNSIGNED,
            allowNull: false,
            references: { model: 'users', key: 'id' }
          },
          questionnaire_id: {
            type: Sequelize.INTEGER(10).UNSIGNED,
            allowNull: false,
            references: { model: 'questionnaires', key: 'id' }
          },
          code: {
            type: Sequelize.STRING(50),
            allowNull: false
          },
          score: {
            type: Sequelize.STRING(50),
            allowNull: false,
            defaultValue: ''
          },
          html: {
            type: Sequelize.TEXT,
            allowNull: false,
            defaultValue: ''
          },
          with_faces: {
            type: Sequelize.INTEGER(1),
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
