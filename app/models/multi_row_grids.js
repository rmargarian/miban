/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('MultiRowGrid', {
    question_id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      defaultValue: '0'
    },
    grid_array: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'multi_row_grids'
  });
};
