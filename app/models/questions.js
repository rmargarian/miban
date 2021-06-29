/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const Question = sequelize.define('Question', {
    label_set_id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true
    },
    type: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
    },
    quest_type: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(512),
      allowNull: false
    },
    question_code: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    help: {
      type: DataTypes.STRING(1024),
      allowNull: true
    },
    more_info: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_commented: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: true,
      defaultValue: '0'
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
    },
    is_bonus: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: '0'
    },
    is_cloud: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '0'
    },
    is_sort_hide: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '0'
    },
    is_faces: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '0'
    },
    is_mandatory: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: true,
      defaultValue: '1'
    },
    is_vertical_alig: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: true,
      defaultValue: '0'
    },
    item_numbers: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true,
      defaultValue: '0'
    },
    comment_row: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true
    },
    comment_label: {
      type: DataTypes.STRING(512),
      allowNull: true,
      defaultValue: ''
    },
    explanation: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_comment_label: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: true,
      defaultValue: '0'
    },
    min_selected_options: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true
    },
    max_selected_options: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true
    },
    switch_type_graph: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: true,
      defaultValue: '0'
    },
    question_graph_type: {
      type: DataTypes.INTEGER(5).UNSIGNED,
      allowNull: false,
      defaultValue: '1'
    },
    slider_mode: {
      type: DataTypes.INTEGER(1),
      allowNull: true
    },
    range_interval: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    },
    range_from_tag: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    range_from_value: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    },
    range_to_tag: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    range_to_value: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    },
    range_percentages: {
      type: DataTypes.INTEGER(1),
      allowNull: true
    },
    show_labels: {
      type: DataTypes.INTEGER(1),
      allowNull: true
    },
    show_tooltips: {
      type: DataTypes.INTEGER(1),
      allowNull: true
    },
    deleted: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: false,
      defaultValue: '0'
    }
  }, {
    tableName: 'questions'
  });

  Question.associate = function (models) {
    Question.hasMany(models.QuestionGroupsQuestionsMap, {foreignKey: 'question_id', as: 'question_groups_questions_map'});
    Question.hasMany(models.User, {foreignKey: 'company_id', as: 'users'});
    Question.hasMany(models.QuestionAnswerOption, {foreignKey: 'question_id', as: 'question_options'});
    models.QuestionGroupsQuestionsMap.belongsTo(models.QuestionGroup, {foreignKey: 'question_group_id', as: 'question_group' });
    models.QuestionGroup.belongsTo(models.Questionnaire, {foreignKey: 'questionnaire_id', as: 'questionnaire'});
    Question.belongsTo(models.LabelSet, {foreignKey: 'label_set_id', as: 'label_set'});
    Question.hasMany(models.QuestionAnswerOption, {foreignKey: 'question_id', as: 'question_answer_options'});
    Question.hasMany(models.SlidersTag, {foreignKey: 'id_question', as: 'sliderTags'});
  };

  return Question;
};
