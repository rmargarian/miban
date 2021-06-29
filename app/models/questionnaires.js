/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const Model = sequelize.define('Questionnaire', {
    type: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true,
      defaultValue: '0'
    },
    title: {
      type: DataTypes.STRING(512),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(1024),
      allowNull: true
    },
    abbreviation: {
      type: DataTypes.STRING(25),
      allowNull: true,
    },
    welcome: {
      type: DataTypes.STRING(1024),
      allowNull: true
    },
    email_from: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    inv_email_subject: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    inv_email_template: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    rem_email_subject: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    rem_email_template: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    conf_email_subject: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    conf_email_template: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    pubreg_email_subject: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    pubreg_email_template: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    sponsor_email_subject: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    sponsor_email_template: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    incomplete_timeout: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true
    },
    deleted: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '0'
    }
  }, {
    tableName: 'questionnaires'
  });

  Model.associate = models => {
    Model.belongsToMany(models.Company, {
      as: 'questCompanies',
      foreignKey: 'questionnaire_id',
      otherKey: 'company_id',
      through: 'company_questionnaire_maps'});
    Model.hasMany(models.Attempt, {foreignKey: 'questionnaire_id', as: 'q_attempts'});
    Model.hasMany(models.QuestionGroup, {foreignKey: 'questionnaire_id', as: 'q_groups'});
    Model.hasMany(models.CompanyQuestionnaireMap, {foreignKey: 'questionnaire_id', as: 'company_questionnaire_maps'});
  };

  return Model;
};
