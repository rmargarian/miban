/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('SlidersTag', {
    id_question: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false
    },
    slider: {
      type: DataTypes.STRING(5),
      allowNull: false
    },
    tag: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    value: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    is_default: {
      type: DataTypes.CHAR(1),
      allowNull: false,
      defaultValue: '0'
    },
    position: {
      type: DataTypes.INTEGER(6),
      allowNull: false
    }
  }, {
    tableName: 'sliders_tags'
  });
};
