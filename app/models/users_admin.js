/* jshint indent: 2 */
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

module.exports = function(sequelize, DataTypes) {
  const Model = sequelize.define('UserAdmin', {
    email: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    enabled: {
      type: DataTypes.INTEGER(1),
      allowNull: false
    },
    salt: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    password: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true
    },
    password_change_token: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: ''
    },
    password_change_token_date_expiration: {
      type: DataTypes.DATE,
      allowNull: true
    },
    roles: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    credentials_expired: {
      type: DataTypes.INTEGER(1),
      allowNull: true
    },
    credentials_expire_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    created: {
      type: DataTypes.DATE,
      allowNull: false
    },
    last_access: {
      type: DataTypes.DATE,
      allowNull: true
    },
    currency_country: {
      type: DataTypes.INTEGER(5).UNSIGNED,
      allowNull: false,
      defaultValue: '145'
    },
    username: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    is_super: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: '0'
    },
  }, {
    tableName: 'users_admin',
    defaultScope: {
      attributes: { exclude: [ 'salt' ] }
    }
  });

  Model.prototype.setPassword = function(password){
    this.salt = crypto.randomBytes(16).toString('hex');
    this.password = crypto.createHash('md5').update(password).digest('hex');
  };

  Model.prototype.validPassword = function(password) {
    let passwordHash = crypto.createHash('md5').update(password).digest('hex');
    return this.password === passwordHash;
  };

  Model.prototype.generateJwt = function() {
    let expiry = new Date();
    expiry.setDate(expiry.getDate() + 14);
    //expiry.setDate(expiry.getDate() + 1);

    return jwt.sign({
      id: this.get('id'),
      email: this.email,
      name: this.name,
      exp: parseInt(expiry.getTime() / 1000),
      //exp: parseInt(expiry.getTime() / 1000 - 86340),
    }, require('../config/config').jwt_encryption);
  };

  Model.prototype.getShortInfo = function(){
    return {
      'id': this.id,
      'email': this.email,
      'name': this.name,
      'last_access': this.last_access,
      'currency_country': this.currency_country,
      'username': this.username
    }
  };

  return Model;
};
