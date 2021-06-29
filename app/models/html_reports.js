/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const HtmlReport = sequelize.define('HtmlReports', {
    cid: {
      type: DataTypes.INTEGER(8).UNSIGNED,
      allowNull: false,
    },
    qid: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      defaultValue: '23'
    },
    name: {
      type: DataTypes.STRING(250),
      allowNull: false,
      defaultValue: ''
    },
    dt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: '0000-00-00 00:00:00'
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: ''
    },
    html: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    s_order: {
      type: DataTypes.INTEGER(9),
      allowNull: false,
      defaultValue: '0'
    }
  }, {
    tableName: 'html_reports'
  });

  HtmlReport.associate = models => {
    HtmlReport.belongsTo(models.Questionnaire, {foreignKey: 'qid', as: 'reportQuestionnaire'});
    HtmlReport.belongsTo(models.Company, {foreignKey: 'cid', as: 'companies'});

  };


  return HtmlReport;
};
