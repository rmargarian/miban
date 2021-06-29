/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('SimKey', {
    title: {
      type: DataTypes.STRING(512),
      allowNull: false
    },
    company_key: {
      type: DataTypes.STRING(512),
      allowNull: false
    },
  }, {
    tableName: 'sim_keys'
  });
};
