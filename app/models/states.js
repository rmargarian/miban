/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('State', {
    country_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(512),
      allowNull: false
    },
    code: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    order_pos: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true,
      defaultValue: '1'
    }
  }, {
    tableName: 'states'
  });
};
