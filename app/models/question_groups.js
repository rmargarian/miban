/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const Model = sequelize.define('QuestionGroup', {
    questionnaire_id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(512),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(1024),
      allowNull: true
    },
    order_pos: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true,
      defaultValue: '1'
    },
    is_active: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: true,
      defaultValue: '1'
    }
  }, {
    tableName: 'question_groups'
  });

  Model.associate = models => {
    Model.belongsTo(models.Questionnaire, {foreignKey: 'questionnaire_id', as: 'questionnaire_group'});
    Model.hasMany(models.QuestionGroupsQuestionsMap, {foreignKey: 'question_group_id', as: 'group_questions_map'});
  };

  return Model;
};
