/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const Model = sequelize.define('SendEmailTemplate', {
    quest_id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false
    },
    email_type: {
      type: DataTypes.STRING(15),
      allowNull: false
    },
    email_subject: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    email_desc: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    tpl_content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    important: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '0'
    },
    createdAt: {
      type: DataTypes.DATE
    },
    updatedAt: {
      type: DataTypes.DATE
    }
  }, {
    timestamps  : true,
    tableName: 'send_email_templates'
  });

  return Model;
};
