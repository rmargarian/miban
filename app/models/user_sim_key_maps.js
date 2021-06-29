/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const Model = sequelize.define('UserSimKeyMap', {
    user_id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    sim_key_id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      primaryKey: true
    }
  }, {
    tableName: 'user_sim_key_maps'
  });

  return Model;
};
