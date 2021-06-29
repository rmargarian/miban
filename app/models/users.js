/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const Model = sequelize.define('User', {
      company_id: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: false,
        references: {
          model: 'Company',
          key: 'id'
        }
      },
      first_name: {
        type: DataTypes.STRING(512),
        allowNull: false
      },
      last_name: {
        type: DataTypes.STRING(250),
        allowNull: true
      },
      email: {
        type: DataTypes.STRING(512),
        allowNull: false,
        validate: {
          isUnique: (value, next) => {
            Model.find({where: {email: value}})
              .then(function (user) {
                if (user) { return next('Email already in use!') }
                return next();
              }).catch(function (err) {
                return next(err);
              });
          }}
      },
      passwd: {
        type: DataTypes.STRING(128),
        allowNull: false,
        defaultValue: ''
      },
      career_category_id: {
        type: DataTypes.INTEGER(10),
        allowNull: true
      },
      job_title: {
        type: DataTypes.STRING(512),
        allowNull: true
      },
      department: {
        type: DataTypes.STRING(512),
        allowNull: true
      },
      manager_name: {
        type: DataTypes.STRING(512),
        allowNull: true
      },
      industry_sector: {
        type: DataTypes.STRING(512),
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
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      p_date: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      p_date2: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      p_location: {
        type: DataTypes.STRING(150),
        allowNull: true,
        defaultValue: ''
      },
      p_groups: {
        type: DataTypes.STRING(150),
        allowNull: true,
        defaultValue: ''
      },
      p_saved: {
        type: DataTypes.STRING(150),
        allowNull: true,
        defaultValue: ''
      },
      ip: {
        type: DataTypes.STRING(150),
        allowNull: true,
        defaultValue: ''
      },
      last_location: {
        type: DataTypes.STRING(150),
        allowNull: true,
        defaultValue: ''
      },
      last_attempt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: '0000-00-00 00:00:00'
      },
      organization: {
        type: DataTypes.STRING(150),
        allowNull: true,
        defaultValue: ''
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: ''
      },
      phone_code: {
        type: DataTypes.STRING(10),
        allowNull: true,
        defaultValue: ''
      },
      phone_iso2: {
        type: DataTypes.STRING(10),
        allowNull: true,
        defaultValue: ''
      },
      isp: {
        type: DataTypes.STRING(150),
        allowNull: true,
        defaultValue: ''
      }
    }, {
      tableName: 'users'
    });

    Model.associate = models => {
      Model.belongsTo(models.Currency, {foreignKey: 'currency_id', as: 'curr'});
      Model.belongsTo(models.Country, {foreignKey: 'country_id', as: 'country'});
      Model.belongsTo(models.CareerCategory, {foreignKey: 'career_category_id', as: 'career'});
      Model.belongsTo(models.TrainingCourse, {foreignKey: 'training_course_id', as: 'training_course'});
      Model.belongsTo(models.Company, {foreignKey: 'company_id', as: 'company'});
      Model.hasMany(models.Attempt, {foreignKey: 'user_id', as: 'attempts'});
      Model.hasMany(models.UserQuestionnaireContact, {foreignKey: 'user_id', as: 'u_q_contact'});
      Model.hasMany(models.UsersQuestionnaireAttemptLimit, {foreignKey: 'user_id', as: 'u_q_limit'});
    };

  return Model;
};

