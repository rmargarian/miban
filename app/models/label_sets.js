/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const Model = sequelize.define('LabelSet', {
    is_system: {
      type: DataTypes.INTEGER(1),
      allowNull: true
    },
    title: {
      type: DataTypes.STRING(512),
      allowNull: false
    }
  }, {
    tableName: 'label_sets'
  });

  Model.associate = function (models) {
    Model.hasMany(models.LabelSetOption, {foreignKey: 'label_set_id', as: 'label_set_options'});
  };

  return Model;
};
