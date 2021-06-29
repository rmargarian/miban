/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('QCategory', {
    name: {
      type: DataTypes.STRING(32),
      allowNull: false
    }
  }, {
    tableName: 'q_categories'
  });
};
