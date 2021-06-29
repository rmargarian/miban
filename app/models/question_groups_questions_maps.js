/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const QuestionGroupsQuestionsMap = sequelize.define('QuestionGroupsQuestionsMap', {
    question_id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    question_group_id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    question_order: {
      type: DataTypes.INTEGER(5).UNSIGNED,
      allowNull: false,
      defaultValue: '0'
    }
  }, {
    tableName: 'question_groups_questions_maps'
  });

  QuestionGroupsQuestionsMap.associate = models => {
    QuestionGroupsQuestionsMap.hasOne(models.Question, {foreignKey: 'id', as: 'question'});
  };

  return QuestionGroupsQuestionsMap;
};
