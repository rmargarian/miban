/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const Model = sequelize.define('ResultReport', {
    user_id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    questionnaire_id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    score: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: ''
    },
    html: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ''
    },
    with_faces: {
      type: DataTypes.INTEGER(1),
      defaultValue: '0'
    },
  }, {
    tableName: 'result_reports'
  });

  Model.associate = models => {
    Model.belongsTo(models.Questionnaire, {foreignKey: 'questionnaire_id', as: 'questionnaire'});
  };

  return Model;
};
