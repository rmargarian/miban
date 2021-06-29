'use strict';
const { UserAnswer, UserAnswerOption } = require('../models');

let UserAnswerController = {};

// Get user answers by attempt id from db
UserAnswerController.getAllByAttemptId = function (req, res) {
  UserAnswer.findAll({where: {attempt_id: req.params.attempt_id}}).then(function (answers) {
    res.status(200).send(answers);
  }).catch(function (error) {
    console.log(error);
    res.status(404).json(error);
  });
}

/**Returns (found or created) user answer by attempt id and question id */
UserAnswerController.findOrCreate = function (req, res) {
  if (!req.body.question_id ||
    !req.body.attempt_id) {
    res.status(400).send({message: 'Some of required fields are missing!'});
    return;
  }

  UserAnswer
    .findOrCreate({
      where: {
        question_id: req.body.question_id,
        attempt_id: req.body.attempt_id
      },
      include: {model: UserAnswerOption, as: 'answer_options'}
    })
    .spread((answer, created) => {
      res.status(200).send(answer);
    }).catch(function (err) {
      res.status(404).json(err);
    });
}

UserAnswerController.create = function (req, res) {
  if (!req.body.question_id ||
    !req.body.attempt_id) {
    res.status(400).send({message: 'Some of required fields are missing!'});
    return;
  }
  UserAnswer.create(req.body)
  .then((answer) => {
    res.status(200).send(answer);
  }).catch(function (err) {
    res.status(404).json(err);
  });
}

UserAnswerController.update = function (req, res) {
  if (!req.body.question_id ||
    !req.body.attempt_id) {
    res.status(400).send({message: 'Some of required fields are missing!'});
    return;
  }
  UserAnswer.update(req.body, {
    where: { id: req.body.id }
  })
  .then(() => {
    res.status(200).send({message: 'UserAnswer Updated!'});
  }).catch(function (err) {
    res.status(404).json(err);
  });
}

module.exports = UserAnswerController;
