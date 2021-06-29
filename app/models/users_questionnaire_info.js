/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('UserQuestionnaireInfo', {
    user_id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
      primaryKey: true
    },
    id_questionnaire: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
      primaryKey: true
    },
    info: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'users_questionnaire_info',
    defaultScope: { attributes: { exclude: [ 'id'] } }
  });
};
