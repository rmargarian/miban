/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('NspNormalDistribution', {
    keys: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    users: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    complete: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    avoid: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    accommodate: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    compromise: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    collaborate: {
      type: DataTypes.STRING(32),
      allowNull: false
    }
  }, {
    tableName: 'nsp_normal_distribution'
  });
};
