/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const Model = sequelize.define('CompanyQuestionnaireMap', {
    questionnaire_id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    company_id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      primaryKey: true
    }
  }, {
    tableName: 'company_questionnaire_maps'
  });

  Model.associate = models => {
    Model.hasOne(models.Questionnaire, {foreignKey: 'id', as: 'questionnaire'});
    Model.belongsTo(models.Company, {foreignKey: 'company_id', as: 'companyQuests', through: 'company_questionnaire_maps'});
  };

  return Model;
};
