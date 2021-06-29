'use strict';

const requestIp = require('request-ip');
const iplocation = require("iplocation").default;
const IncomingForm = require('formidable').IncomingForm;
const XLSX = require('xlsx');
const utils = require('../utils');
const send_utils = require('../utils/send-template');
const {
  Sequelize, User, Currency, Company, Country, CareerCategory, Attempt, UserAnswer,
  UserQuestionnaireContact, UsersQuestionnaireAttemptLimit, UserAnswerOption
} = require('../models');
const secure = require('../utils/auth');

const Uploader = require('../services/upload.service');
const uploader = new Uploader().getInstance();
const simDelegate = require('../utils/sim-delegate');

let UserController = {};

/**
 * Returns array of users belonged to passed 'company_id',
 * Each user includes 'Currency', 'UserQuestionnaireContact' and
 * 'UsersQuestionnaireAttemptLimit' objects.
 * 'UsersQuestionnaireAttemptLimit' object includes 'Attempt' object.
 * Expected req.params: company_id
 */
UserController.getAllbyCompany = function (req, res) {
  const company_id = req.params.company_id;
  const where = {company_id: company_id};
  if (req.query && req.query.emailsNotEmpty) {
    where.email = {[Sequelize.Op.notIn]: ['', 'invalid']};
  }

  let userQuery = {
    where: where,
    attributes: {
      exclude: []
    },
    include: [
      {model: Currency, as: 'curr'},
      {model: UserQuestionnaireContact, as: 'u_q_contact'},
      {model: CareerCategory, as: 'career'},
      {model: Country, as: 'country'},
      {model: UsersQuestionnaireAttemptLimit, as: 'u_q_limit'},
      {
        model: Attempt, as: 'attempts', include: [{model: UserAnswer, as: 'answers'}]
      }]
  };

  User.findAll(userQuery).then(users => {
    res.status(200).send(users);
  }).catch(function (error) {
    console.log(error);
    res.status(404).json(error);
  });
};

/**
 * Creates new user in 'users' table.
 */
UserController.createUser = function (req, res) {
  if (
    !req.body.company_id ||
    !req.body.first_name ||
    !req.body.last_name ||
    !req.body.email) {

    res.status(400).json({
      message: 'Some of required fields are missing!'
    });
    return;
  }

  const user = req.body;
  if (req.body.updateDate) {
    user.last_attempt = send_utils.getFormatedCurrentDate();
  }

  User.create(user)
    .then(function (user) {
      res.status(200).send(user);
    })
    .catch(Sequelize.ValidationError, function (err) {
      // validation errors
      res.status(422).send(err.errors);
    })
    .catch(function (err) {
      console.log(err);
      res.status(404).json(err);
    });
};

/**Returns (found or created) user by email */
UserController.findOrCreate = function (req, res) {
  if (
    !req.body.company_id ||
    !req.body.first_name ||
    !req.body.email) {

    res.status(400).json({
      message: 'Some of required fields are missing!'
    });
    return;
  }

  User.findOrCreate({
      where: { email: req.body.email },
      defaults: {company_id: req.body.company_id, first_name: req.body.first_name},
      include: [
        { model: Company, as: 'company' },
        { model: Country, as: 'country' }
      ]
    })
    .spread((user, created) => {
      /**Don't change user's key */
      delete req.body.company_id;
      return user.update(req.body);
    }).then((user) => {
      res.status(200).send(user);
    }).catch(function (err) {
      res.status(404).json(err);
    });
};

// Update user
UserController.updateUser = function (req, res) {
  if (!req.body.id ||
    !req.body.company_id ||
    !req.body.first_name ||
    !req.body.last_name ||
    !req.body.email) {

    res.status(400).json({
      message: 'Some of required fields are missing!'
    });
    return;
  }

  User.findById(req.body.id)
    .then(function (user) {
      /**If company_id has changed */
      if (req.body.company_id !== user.company_id) {
        /**Send update user Pfa key request to NegSim server */
        simDelegate.commandUpdateUsersPfaKey({keyId: req.body.company_id, userIds: [user.id]});
      }
      const us = req.body;
      if (req.body.updateDate) {
        us.last_attempt = send_utils.getFormatedCurrentDate();
      }
      return user.update(us);
    })
    .then((user) => {
      res.status(200).send(user);
    })
    .catch(function (error) {
      console.log(error);
      res.status(404).json(error);
    });
};

/**
 * Updates user's last logged in IP address
 * and last location ('countryCode' + 'city') by IP.
 * Expected req.body param: 'id' (user's id)
 */
UserController.updateUserIp = function (req, res) {
  if (!req.body.id) {
    res.status(400).json({
      message: "User's id is missing!"
    });
    return;
  }

  const clientIp = requestIp.getClientIp(req);
  const query = {ip: clientIp};
  iplocation(clientIp)
  .then((geo) => {
    query.last_location = geo.countryCode;
    if (geo.city) { query.last_location += (", " + geo.city); }
    User.update(query, { where: {id: req.body.id} })
    .then(() => {
      res.status(200).send({message: "User's Geo is Updated!"});
    }).catch(function (err) {
      res.status(404).json(err);
    });
  })
  .catch(err => {
    res.status(404).json(err);
  });
};

/**
 * Deletes users by array of ids.
 * Required req.params: 'ids' - string with ids separated by comma.
 */
UserController.deleteUsers = function (req, res) {
  const ids = req.params.ids.split(',');
  User.destroy({ where: { id: ids }})
  .then(() => {
    res.status(200).send({message: 'Users Deleted!'});
  })
  .catch(function (error) {
    console.log(error);
    res.status(404).json(error);
  });
}

/**
 * Checks if email is in use.
 * Expected req.params: (email: string)
 */
UserController.isEmailValid = function (req, res) {
  User.find({where: {email: req.params.email}})
    .then(function (user) {
      const isValid = user ? false : true;
      res.status(200).send(isValid);
    }).catch(function (err) {
    res.status(404).json(err);
  });
}

UserController.isPasswordValid = function (req, res) {
  User.find({where: {email: req.body.email}})
    .then(function (user) {
      const isValid = user.passwd === req.body.passwd ? true : false;
      res.status(200).send(isValid);
    }).catch(function (err) {
    res.status(404).json(err);
  });
}

/**
 * Returns array of users found by emails.
 * Expected req.params: (emails: string - emails separated by comma)
 */
UserController.getUsersByEmails = function (req, res) {
  const emails = req.params.emails.split(',');
  User.findAll({where: {email: emails}, attributes: {
    exclude: ['ip']
  },
    include: [
      { model: Company, as: 'company', attributes: ['id', 'title', 'company_key', 'admin_email', 'admin'] }
    ]
  })
  .then(function (user) {
    res.status(200).send(user);
  }).catch(function (err) {
    res.status(404).json(err);
  });
};

/**
 * Returns User if correct or secret key (for change user's key) is passed
 * Or null
 * Expected req.query parameters: uId (User id), kId (Company Id) and optional: sKey (secret key)
 */
UserController.getUserWithCompanyId = function (req, res) {
  User.find({where: {id: req.query.uId}, attributes: {exclude: ['ip']}})
    .then(function (user) {
      const secretKey = secure.encrypt(user.dataValues.passwd);
      if (user.dataValues.company_id === parseInt(req.query.kId, 10) ||
          secretKey === req.query.sKey) {
          res.status(200).send(user);
      } else {
        res.status(200).send(null);
      }
    })
    .catch(function (error) {
      console.log(error);
      res.status(404).json(error);
  });
};

/**
 * Returns User by id (include Currency, CareerCategory, Country),
 * include UsersQuestionnaireAttemptLimit and attempts (include answers with answer_options),
 * include Company ('id') to identify if user belongs to chosen key (if not method will return null)
 * Expected req.query parameters:
 * uId (User id),
 * qId (Questionnaire id),
 * kId (Company Id)
 */
 UserController.getUserAttempts = function (req, res) {
  let userData;

  User.findById(req.query.uId,
    {include: [
      {model: Currency, as: 'curr'},
      {model: CareerCategory, as: 'career'},
      {model: Country, as: 'country'},
      {model: Company, as: 'company', where: {id: req.query.kId}, attributes: ['id'] }]
  }, {attributes: {exclude: ['ip']}})
  .then(user => {
    if (user) {
      userData = user.dataValues;
      return Attempt.findAll({
        where: {user_id: req.query.uId, questionnaire_id: req.query.qId},
        include: [{model: UserAnswer, as: 'answers',
          include: {model: UserAnswerOption, as: 'answer_options'}}]})
    } else {
      res.status(200).send(user);
    }
  })
  .then(attempts => {
    if (attempts) {
      userData.attempts = attempts;
    }
    return UsersQuestionnaireAttemptLimit.findOne(
      {where: {user_id: req.query.uId, id_questionnaire: req.query.qId}});
  })
  .then(limit => {
    if (limit) {
      userData.u_q_limit = limit;
    }
    res.status(200).send(userData);
  }).catch(function (error) {
    console.log(error);
    res.status(404).json(error);
  });
}

/**
 * Updata 'Location', 'Date', 'Date2', 'Saved' and 'Groups' fields of selected Users.
 * Expected req.body params:
 * {ids: selected users ids,  date: ..., date2: ..., groups: ..., saved: ..., location: ...,
 * isClearDate2: if true clears Date2 for all selected participants}
 */
UserController.updateFields = function (req, res) {
  let query = {};
  if (req.body.location) { query.p_location = req.body.location; }
  if (req.body.date) { query.p_date = req.body.date || ''; }
  if (req.body.date2 || req.body.isClearDate2) { query.p_date2 = req.body.date2 || ''; }
  if (req.body.groups) { query.p_groups = req.body.groups; }
  if (req.body.saved) { query.p_saved = req.body.saved; }
  User.update(query, { where: {id: req.body.ids} })
  .then(() => {
    res.status(200).send({message: 'Fields Updated!'});
  }).catch(function (err) {
    res.status(404).json(err);
  });
};

/**
 * Change users 'company_id'.
 * Expected req.body params:
 * - userIds,
 * - companyId
 */
UserController.moveUsers = function (req, res) {
  const keyId = req.body.companyId;
  const userIds = req.body.userIds;
  User.update({company_id: keyId}, {where: {id: userIds}})
  .then(() => {
    /**Send update users Pfa key request to NegSim server */
    simDelegate.commandUpdateUsersPfaKey({keyId: keyId, userIds: userIds});

    res.status(200).send({message: 'Moved success!'});
  }).catch(function (err) {
    res.status(404).json(err);
  });
};

/**
 * Gets previously uploaded (in uploadUsers function) from excel file users (stored in upload.service.js)
 * Creates new user if no 'id' field
 * or updates user if 'id' is present.
 * Expected req.body param: companyId
 */
UserController.importUsers = function (req, res) {
  const users = uploader.users;
  let validUsers = utils.validateUsers(users, req.body.companyId);
  let queries = [];
  validUsers.forEach(user => {
    if(user.id) {
      delete user.email;
      queries.push( User.update(user, {where: {id: user.id}}) );
    } else {
      queries.push( User.create(user) );
    }
  });

  return Promise.all(queries)
  .then(() => {
    res.status(200).send({message: 'Import success!'});
  }).catch(function (err) {
    res.status(404).json(err);
  });
};

/**
 * Reads .xls or .xlsx file. Stores each row in array: User[]
 * Finds existing users by emails. If some email already used, sets 'id' property for user.
 */
UserController.uploadUsers = function (req, res) {
  const form = new IncomingForm();

  form.on('file', (field, file) => {
    try {
      const workbook = XLSX.readFile(file.path);

      const first_sheet_name = workbook.SheetNames[0];
      /** Get first worksheet */
      const worksheet = workbook.Sheets[first_sheet_name];
      /**Get filled Range of worksheet (top-left cell : bottom-right cell, e.g. "A2:F5") */
      const range = worksheet['!ref'];
      if (!range) {
        uploader.users = [];
        res.status(200).send([]);
        return;
      }
      const rangeSplit = range.split(':');
      /**We have 3 required fields and 6 optional. So we will read columns from A to I.*/
      const firstRow = utils.getNumber(rangeSplit[0]);
      const lastRow = utils.getNumber(rangeSplit[1]);
      const users = [];
      const emails = [];
      for (let i = firstRow; i <= lastRow; i++) {
        const user = {};
        if (worksheet['A' + i]) { user.first_name = worksheet['A' + i].v ? worksheet['A' + i].v.trim() : ''; }
        if (worksheet['B' + i]) { user.last_name = worksheet['B' + i].v ? worksheet['B' + i].v.trim() : ''; }
        if (worksheet['C' + i]) { user.email = worksheet['C' + i].v ? worksheet['C' + i].v.trim() : ''; }
        if (worksheet['D' + i]) { user.job_title = worksheet['D' + i].v ? worksheet['D' + i].v.trim() : ''; }
        if (worksheet['E' + i]) { user.department = worksheet['E' + i].v ? worksheet['E' + i].v.trim() : ''; }
        if (worksheet['F' + i]) { user.manager_name = worksheet['F' + i].v ? worksheet['F' + i].v.trim() : ''; }
        if (worksheet['G' + i]) { user.passwd = worksheet['G' + i].v ? worksheet['G' + i].v.trim() : ''; }
        if (worksheet['H' + i]) { user.p_date = worksheet['H' + i].w ? worksheet['H' + i].w.trim() : ''; }
        if (worksheet['I' + i]) { user.p_location = worksheet['I' + i].v ? worksheet['I' + i].v.trim() : ''; }

        if (user.email) {
          user.email = user.email.toString().replace(/ /g, '');
          emails.push(user.email);
        }
        if (user.p_date) {
          user.p_date = user.p_date.replace(/ /g, '');
          user.p_date = user.p_date.replace(/\./g, '\/');
        }
        if (!utils.isEmptyObject(user)) { users.push(user); }
      }

      User.findAll({
        where: { email: emails },
        include: [
          { model: Company, as: 'company', attributes: ['id', 'title', 'company_key', 'admin_email', 'admin'] }
        ]
      })
      .then(function (existing_users) {
        if (existing_users.length) {
          users.forEach((user) => {
            let obj = undefined;
            if (user.email) {
              obj = existing_users.find((u) => u.email.toLowerCase() === user.email.toLowerCase());
            }
            if (obj) {
              user.id = obj.id;
              user.company = obj.company;
            }
          });
        }
        uploader.users = users;

        console.log('********uploadUsers:: res.status(200)');
        res.status(200).send(users);
      }).catch(function (err) {
        console.log('********uploadUsers:: res.status(404)');
        res.status(404).json(err);
      });
    } catch (error) {
      res.statusMessage = 'Incorrect/Empty Participants data';
      res.status(409).end();
    }

  });

  form.on('error', function (err) {
    console.log('********formidable.IncomingForm ERROR event');
    console.error(err);
    res.status(400).json(err);
  });

  form.on('end', function () {
    console.log('********formidable.IncomingForm END event');
  });

  console.log('********uploadUsers:: BEFORE form.parse(req)');
  form.parse(req);
  console.log('********uploadUsers:: AFTER form.parse(req)');
};

/**
 * Returns array of users whose first_name/last_name/email are matches passed value
 * Expected
 */
UserController.findUsers = function (req, res) {
  const value = req.params.value;
  User.findAll({where: {
    [Sequelize.Op.or]: [{email: {[Sequelize.Op.like]: `%${value}%`}},
                        {first_name: {[Sequelize.Op.like]: `%${value}%`}},
                        {last_name: {[Sequelize.Op.like]: `%${value}%`}}]
  },
    include: [
      { model: Company, as: 'company', attributes: ['id', 'title', 'company_key'] }
    ]})
  .then(function (users) {
    res.status(200).send(users);
  }).catch(function (err) {
    res.status(404).json(err);
  });
};

module.exports = UserController;
