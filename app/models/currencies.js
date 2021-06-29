/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Currency', {
    currency: {
      type: DataTypes.STRING(5),
      allowNull: false
    },
    num: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    currency_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    tableName: 'currencies'
  });
};
