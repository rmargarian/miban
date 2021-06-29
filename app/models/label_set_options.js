/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('LabelSetOption', {
    label_set_id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false
    },
    value: {
      type: DataTypes.STRING(512),
      allowNull: false
    },
    order_pos: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true,
      defaultValue: '1'
    }
  }, {
    tableName: 'label_set_options'
  });
};
