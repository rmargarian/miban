/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const Model = sequelize.define('IncompleteAttempt', {
    questionnaire_id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false
    },
    status: { //(started = 1/completed = 2)
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: false,
      defaultValue: '1'
    },
    ip: {
      type: DataTypes.STRING(150),
      allowNull: false,
      defaultValue: ''
    },
    country: {
      type: DataTypes.STRING(150),
      allowNull: false,
      defaultValue: ''
    },
    state: {
      type: DataTypes.STRING(150),
      allowNull: false,
      defaultValue: ''
    },
    city: {
      type: DataTypes.STRING(150),
      allowNull: false,
      defaultValue: ''
    },
    browser: {
      type: DataTypes.STRING(150),
      allowNull: false,
      defaultValue: ''
    },
    responses: {
      type: DataTypes.INTEGER(10),
      allowNull: false,
      defaultValue: '0'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
   },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
   }
  }, {
    tableName: 'incompete_attempts'
  });

  Model.associate = models => {
    Model.belongsTo(models.Questionnaire, {foreignKey: 'questionnaire_id', as: 'questionnaire'});
  };

  return Model;
};
