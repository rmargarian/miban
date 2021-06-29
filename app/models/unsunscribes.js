/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const Model = sequelize.define('Unsubscribe', {
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      defaultValue: ''
    },
    questionnaire_id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
   },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
   }
  }, {
    tableName: 'unsubscribes'
  });

  return Model;
};
