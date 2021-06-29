'use strict';
const { Unsubscribe } = require('../models');
const unsub = require('../utils/unsubscribe');

let UnsubscribeController = {};

/**
 * Creates new unsubscribe.
 * Required req.query param: 'data' - string contains encrypted object: {email, questionnaire_id}
 */
UnsubscribeController.create = function (req, res) {
  if (req.query && req.query.data) {
    unsub.add(req.query.data);
    res.status(200).send({message: 'Unsubscribe Success!'});
  } else {
    res.status(400).send({message: 'Unsubscribe Fail!'});
  }
};

/**
 * Deletes unsubscribes by ids.
 * Required req.params: 'ids' - string with ids separated by comma.
 */
UnsubscribeController.delete = function (req, res) {
  const ids = req.params.ids.split(',');
  Unsubscribe.destroy({ where: { id: ids }})
  .then(() => {
    res.status(200).send({message: 'Unsubscribes Deleted!'});
  })
  .catch(function (error) {
    console.log(error);
    res.status(404).json(error);
  });
};

module.exports = UnsubscribeController;
