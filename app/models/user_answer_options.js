/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const UserAnswerOption = sequelize.define('UserAnswerOption', {
    answer_id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false
    },
    question_answer_options_id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true
    },
    label_set_options_id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true
    },
    user_order_pos: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true
    }
  }, {
    tableName: 'user_answer_options'
  });

  UserAnswerOption.associate = models => {
    UserAnswerOption.belongsTo(models.QuestionAnswerOption, {
      foreignKey: 'question_answer_options_id',
      as: 'question_answer_option'
    });
    UserAnswerOption.belongsTo(models.LabelSetOption, {
      foreignKey: 'label_set_options_id',
      as: 'label_set_option'
    });
  };

  return UserAnswerOption;
};
