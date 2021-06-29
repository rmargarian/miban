'use strict';
const send_utils = require('../utils/send-template');
const { Attempt, User } = require('../models');

let AttemptController = {};

AttemptController.getById = function (req, res) {
  const id = req.params.id;
  Attempt.findById(id)
  .then(function (attempt) {
    res.status(200).send(attempt);
  }).catch(function (error) {
    res.status(404).json(error);
  });
};

/**
 * Creates new attempt.
 * Required req.body params: 'user_id' and 'questionnaire_id'
 */
AttemptController.create = function (req, res) {
  if (!req.body.user_id ||
    !req.body.questionnaire_id) {
    res.status(400).send({message: 'Some of required fields are missing!'});
    return;
  }

  let att = req.body;
  att.start_date = send_utils.getFormatedCurrentDate();
  att.last_activity_date = send_utils.getFormatedCurrentDate();

  Attempt.create(att)
    .then(function (attempt) {
      res.status(200).send(attempt);
    }).catch(function (err) {
      res.status(404).json(err);
    });
};

AttemptController.update = function (req, res) {
  if (!req.body.id) {
    res.status(400).send({message: 'Attempt id is missing!'});
    return;
  }

  const att = req.body;
  att.last_activity_date = send_utils.getFormatedCurrentDate();

  Attempt.update(att, {
    where: { id: att.id }
  })
  .then(function (attempt) {
    res.status(200).send(attempt);
  }).catch(function (err) {
    res.status(404).json(err);
  });
};

// Delete Attempt by id
AttemptController.deleteAttempt = function (req, res) {
  Attempt.findById(req.params.attempt_id)
    .then(function (attempt) {
      return attempt.destroy();
    }).then(() => {
      res.status(200).send({message: 'Attempt Deleted!'});
    })
  .catch(function (error) {
    console.log(error);
    res.status(404).json(error);
  });
};


/**
 * Checks if user with passed email has taken questionnaire with passed id.
 * Expected req.params: (email: string, qId: string).
 * If taken returns false - not valid
 */
AttemptController.isAttemptValid = function (req, res) {
  User.find({where: {email: req.params.email},
    include: [{
        model: Attempt, as: 'attempts', where: {questionnaire_id: req.params.qId}
      }]})
    .then(function (user) {
      const isValid = user ? false : true;
      res.status(200).send(isValid);
    }).catch(function (err) {
    res.status(404).json(err);
  });
};


module.exports = AttemptController;
