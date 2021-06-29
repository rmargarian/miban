/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('QuestionAnswerOption', {
    question_id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false
    },
    order_pos: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true,
      defaultValue: '1'
    },
    title: {
      type: DataTypes.STRING(512),
      allowNull: false
    },
    correct_answer: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true
    },
    score: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    face_type: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '0'
    },
    qcategory: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true
    }
  }, {
    tableName: 'question_answer_options'
  });
};
