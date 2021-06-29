/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const Model = sequelize.define('UserAnswer', {
    question_id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false
    },
    attempt_id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false
    },
    comment: {
      type: DataTypes.STRING(3500),
      allowNull: true
    },
    answer: {
      type: DataTypes.STRING(3500),
      allowNull: true
    }
  }, {
    tableName: 'user_answers'
  });

  Model.associate = models => {
    Model.belongsTo(models.Question, {foreignKey: 'question_id', as: 'question'});
    Model.hasMany(models.UserAnswerOption, {foreignKey: 'answer_id', as: 'answer_options'});
  };
  return Model;
};
