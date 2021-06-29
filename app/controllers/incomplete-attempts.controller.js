'use strict';
const { IncompleteAttempt } = require('../models');

let IncompleteAttemptController = {};


// Get all incomplete attempts by Questionnaire id
IncompleteAttemptController.getAllByQId = (req, res) => {
  const qId = req.params.qId;
  IncompleteAttempt.findAll({
    where: {questionnaire_id: qId}
  }).then(attempts => {
    res.status(200).send(attempts);
  }).catch(function (error) {
    console.log(error);
    res.status(404).json(error);
  });
};

// Get incomplete attempt by id
IncompleteAttemptController.getById = (req, res) => {
  const id = req.params.id;
  IncompleteAttempt.findOne({
    where: {id: id}
  }).then(attempt => {
    res.status(200).send(attempt);
  }).catch(function (error) {
    console.log(error);
    res.status(404).json(error);
  });
};

/**
 * Creates new incompete attempt.
 * Required req.body params: 'ip' and 'questionnaire_id'
 */
IncompleteAttemptController.create = function (req, res) {
  if (!req.body.questionnaire_id) {
    res.status(400).send({message: 'Questionnaire id is missing!'});
    return;
  }

  let att = req.body;

  IncompleteAttempt.create(att)
    .then(function (attempt) {
      res.status(200).send(attempt);
    }).catch(function (err) {
      res.status(404).json(err);
    });
};

IncompleteAttemptController.update = function (req, res) {
  if (!req.body.id) {
    res.status(400).send({message: 'Attempt id is missing!'});
    return;
  }

  const att = req.body;

  IncompleteAttempt.update(att, {
    where: { id: att.id }
  })
  .then(function (attempt) {
    res.status(200).send(attempt);
  }).catch(function (err) {
    res.status(404).json(err);
  });
};

/**
 * Deletes incomplete attempts by ids.
 * Required req.body: 'ids' - string with ids separated by comma.
 */
IncompleteAttemptController.delete = function (req, res) {
  const ids = req.body.ids;
  IncompleteAttempt.destroy({ where: { id: ids }})
  .then(() => {
    res.status(200).send({message: 'Incomplete attempts Deleted!'});
  })
  .catch(function (error) {
    console.log(error);
    res.status(404).json(error);
  });
};


module.exports = IncompleteAttemptController;
