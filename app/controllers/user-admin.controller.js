const passport = require('passport');
const randtoken = require('rand-token');
const { UserAdmin } = require('../models');
const errorHandlers = require('../error-handlers');
const utils = require('../utils');

const refreshTokens = {};

module.exports.register = function (req, res) {

  if (!req.body.currency_country || !req.body.name || !req.body.username || !req.body.email || !req.body.password) {
    utils.sendJSONresponse(res, 400, {
      "message": "All fields required"
    });
    return;
  }

  let userAdmin = new UserAdmin({
    email: req.body.email,
    enabled: 1,
    roles: 'a:1:{i:0;s:10:"ROLE_ADMIN"};',
    name: req.body.name,
    created: new Date(),
    currency_country: req.body.currency_country,
    username: req.body.username,
    is_super: req.body.is_super
  });

  userAdmin.setPassword(req.body.password);

  UserAdmin.create(userAdmin.dataValues)
    .then(admin => {
      res.status(200);
      res.json(admin.getShortInfo());
    })
    .catch(err => {
      errorHandlers.dataBaseErrorHandler(err, res);
    })
};

module.exports.login = function (req, res) {

  if (!req.body.username || !req.body.password) {
   utils.sendJSONresponse(res, 400, {
      "message": "All fields required"
    });
    return;
  }

  passport.authenticate('local', function (err, userAdmin, info) {
    let token;

    // If Passport throws/catches an error
    if (err) {
      res.status(404).json(err);
      return;
    }

    // If a user is found
    if (userAdmin) {
      userAdmin.set('last_access', new Date());
      userAdmin.save().then(() => {
        token = userAdmin.generateJwt();
        const refreshToken = randtoken.uid(256);
        refreshTokens[refreshToken] = req.body.username;
        res.status(200);
        res.json({
          "token": token,
          "refreshToken": refreshToken
        });
      }).catch(err => {
        errorHandlers.dataBaseErrorHandler(err, res);
      });
    } else {
      // If user is not found
      res.status(401).json(info);
    }
  })(req, res);
};

module.exports.logout = function (req, res) {
  const refreshToken = req.body.refreshToken;
  if (refreshToken in refreshTokens) {
    delete refreshTokens[refreshToken];
  }
  res.sendStatus(204);
};

module.exports.refresh = function (req, res) {
  const refreshToken = req.body.refreshToken;

  //if (refreshToken in refreshTokens) {
    UserAdmin.find({ where: { email: req.body.email } })
    .then(function (userAdmin) {
      token = userAdmin.generateJwt();
      res.status(200);
      res.json({
        "token": token
      });
    }).catch(function (err) {
      res.status(404).json(err);
    });
  /*}
  else {
    res.sendStatus(401);
  }*/
};

module.exports.getAll = function (req, res) {
  let query = { where: {} };
  //Options that we can return
  let possibleAllowedOptions = [ 'email', 'name', 'last_access', 'currency_country', 'username', 'is_super'];
  //get request fields
  let reqQuery = req.query.fields;

  if(reqQuery !== undefined) {
    let filteredQueries = utils.filterQueryFileds(possibleAllowedOptions, reqQuery);
    filteredQueries.unshift('id');
    query.attributes = filteredQueries;
  }else {
    possibleAllowedOptions.unshift("id");
    query.attributes = possibleAllowedOptions;
  }


  UserAdmin.findAll(query)
    .then(admins => {
    res.json(admins);
  }).catch(err => {
    errorHandlers.dataBaseErrorHandler(err, res);
  })
};

module.exports.delete = function (req, res) {
  const id = req.params.id;

  UserAdmin.destroy({
    where: {
      id: id
    }
  }).then(id => {
    res.status(200);
    res.json(id);
  }).catch(err => {
    errorHandlers.dataBaseErrorHandler(err, res);
  });
};

module.exports.update = function (req, res) {

  UserAdmin.findById(req.body.id)
    .then(admin => {
      if (req.body.password) {
        const password = req.body.password;
        delete req.body.password;
        admin.setPassword(password);
      }
      admin.save()
        .then(() => {
          return admin.update(req.body);
        })
        .then((updated) => {
          res.status(200);
          res.json(updated.getShortInfo());
        })
        .catch(err => {
          errorHandlers.dataBaseErrorHandler(err, res);
        })
    })
    .catch(err => {
      res.status(404).json(err);
    });
};

module.exports.getAdmin = function (req, res) {
  UserAdmin.findById(req.params.admin_id,
    { attributes: [ 'email', 'name', 'last_access', 'currency_country', 'username', 'is_super'] })
    .then(function (admin) {
      res.status(200).send(admin);
    }).catch(function (error) {
    console.log(error);
    res.status(404).json(error);
  });
};

module.exports.isEmailValid = function (req, res) {
  UserAdmin.find({ where: { email: req.params.email } })
    .then(function (admin) {
      const isValid = admin ? false : true;
      res.status(200).send(isValid);
    }).catch(function (err) {
    res.status(404).json(err);
  });
};

module.exports.isUserNameValid = function (req, res) {
  UserAdmin.find({ where: { username: req.params.username } })
    .then(function (admin) {
      const isValid = admin ? false : true;
      res.status(200).send(isValid);
    }).catch(function (err) {
    res.status(404).json(err);
  });
};

