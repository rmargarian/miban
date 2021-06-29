/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('UsersQuestionnaireAttemptLimit', {
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
    attempts_limit: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '1'
    },
    report_completion: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '1'
    }
  }, {
    tableName: 'users_questionnaire_attempt_limit',
    defaultScope: { attributes: { exclude: [ 'id'] } }
  });
};
