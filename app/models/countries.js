/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Country', {
    name: {
      type: DataTypes.STRING(512),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING(512),
      allowNull: false
    },
    currency_id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false
    }
  }, {
    tableName: 'countries'
  });
};
