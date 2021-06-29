/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const Model = sequelize.define('CareerCategory', {
    name: {
      type: DataTypes.STRING(512),
      allowNull: false
    },
    order_pos: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true,
      defaultValue: '1'
    }
  }, {
    tableName: 'career_categories'
  });

  return Model;
};
