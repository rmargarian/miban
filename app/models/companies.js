/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  const Company = sequelize.define('Company', {
    title: {
      type: DataTypes.STRING(512),
      allowNull: false
    },
    date_create: {
      type: DataTypes.DATE,
      allowNull: false
    },
    company_key: {
      type: DataTypes.STRING(512),
      allowNull: false
    },
    type: {
      type: DataTypes.INTEGER(3),
      allowNull: true
    },
    sponsor_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(512),
      allowNull: true
    },
    admin: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    admin_email: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    industry_sector: {
      type: DataTypes.STRING(512),
      allowNull: true
    },
    job_title: {
      type: DataTypes.STRING(512),
      allowNull: true
    },
    manager_name: {
      type: DataTypes.STRING(512),
      allowNull: true
    },
    department: {
      type: DataTypes.STRING(512),
      allowNull: true
    },
    c_category: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    training_date: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    training_course_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    country_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    state_name: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    city: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    currency_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    fe_currency_id: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    },
    exam_id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true
    },
    show_industry_sector: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: true,
      defaultValue: '1'
    },
    show_job_title: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: true,
      defaultValue: '1'
    },
    show_manager_name: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: true,
      defaultValue: '1'
    },
    show_dept: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: true,
      defaultValue: '0'
    },
    show_career_category: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: true,
      defaultValue: '1'
    },
    show_training_date: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: true,
      defaultValue: '1'
    },
    show_training_cource: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: true,
      defaultValue: '1'
    },
    show_country: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: true,
      defaultValue: '1'
    },
    show_state: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: true,
      defaultValue: '1'
    },
    show_city: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: true,
      defaultValue: '1'
    },
    edit_industry_sector: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: true,
      defaultValue: '1'
    },
    edit_job_title: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: true,
      defaultValue: '1'
    },
    edit_manager_name: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: true,
      defaultValue: '1'
    },
    edit_dept: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: true,
      defaultValue: '0'
    },
    edit_career_category: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: true,
      defaultValue: '1'
    },
    edit_training_cource: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: true,
      defaultValue: '1'
    },
    edit_country: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: true,
      defaultValue: '1'
    },
    edit_state: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: true,
      defaultValue: '1'
    },
    edit_city: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: true,
      defaultValue: '1'
    },
    mn_city: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: false
    },
    mn_state: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: false
    },
    mn_country: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: false
    },
    mn_training_cource: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: false
    },
    mn_training_date: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: false
    },
    mn_career_category: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: false
    },
    mn_dept: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: false
    },
    mn_job_title: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: false
    },
    mn_manager_name: {
      type: DataTypes.INTEGER(3),
      allowNull: true
    },
    mn_industry_sector: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: false
    },
    is_set_training_date: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: false,
      defaultValue: '0'
    },
    is_set_training_day: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: false,
      defaultValue: '0'
    },
    reports_pass: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    tableName: 'companies'
  });

  Company.associate = models => {
    Company.belongsTo(models.Currency, {foreignKey: 'currency_id', targetKey: 'id'});
    Company.belongsTo(models.Country, {foreignKey: 'country_id', targetKey: 'id'});
    Company.belongsTo(models.TrainingCourse, {foreignKey: 'training_course_id', targetKey: 'id'});
    Company.belongsToMany(models.Questionnaire, {
      as: 'companyQuests',
      foreignKey: 'company_id',
      otherKey: 'questionnaire_id',
      through: 'company_questionnaire_maps'
    });
    Company.hasMany(models.User, {foreignKey: 'company_id', as: 'users'});
    Company.hasMany(models.CompanyQuestionnaireMap, {foreignKey: 'company_id', as: 'company-questionnaire-maps'});
    Company.hasMany(models.HtmlReports, {foreignKey: 'cid', as: 'reports'});

  };

  return Company;
};
