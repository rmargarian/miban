/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Config', {
    name: {
      type: DataTypes.STRING(512),
      allowNull: false
    },
    value: {
      type: DataTypes.STRING(2048),
      allowNull: true
    }
  }, {
    tableName: 'configs'
  });
};
