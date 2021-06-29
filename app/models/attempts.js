/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const Model = sequelize.define('Attempt', {
    user_id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false
    },
    questionnaire_id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    last_activity_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    is_note_sent: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: true,
      defaultValue: '0'
    },
    passed_time: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    status: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: false,
      defaultValue: '1'
    }
  }, {
    tableName: 'attempts'
  });

  Model.associate = models => {
    Model.belongsTo(models.Questionnaire, {foreignKey: 'questionnaire_id', as: 'questionnaire'});
    Model.hasMany(models.UserAnswer, {foreignKey: 'attempt_id', as: 'answers'});
  };

  return Model;
};
