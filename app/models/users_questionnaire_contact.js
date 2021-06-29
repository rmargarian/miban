/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('UserQuestionnaireContact', {
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
    contact: {
      type: DataTypes.CHAR(1),
      allowNull: false,
      defaultValue: '1'
    }
  }, {
    tableName: 'users_questionnaire_contact',
    defaultScope: { attributes: { exclude: [ 'id'] } }
  });
};
