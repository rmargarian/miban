/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('CurrencyConversion', {
    from_cur: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    to_cur: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    rate: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    st: {
      type: DataTypes.STRING(25),
      allowNull: false
    }
  }, {
    tableName: 'currency_conversion'
  });
};
