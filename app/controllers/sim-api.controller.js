'use strict';

const errorHandlers = require('../error-handlers');
const { Company, SimKey, UserSimKeyMap } = require('../models');
const simDelegate = require('../utils/sim-delegate');

/**
 * Controller handles http requests from NEG-SIM server.
 * Pfa key -> 'companies' DB table
 */
let SimApiController = {};

/**
 * Returns full list of pfa keys (fields: 'id', 'title', 'company_key')
 */
SimApiController.getAllPfaKeys = function (req, res) {
  getPfaKeys()
  .then(function (keys) {
    res.status(200).send(keys);
  }).catch(function (error) {
    console.log(error);
    res.status(404).json(error);
  });
}

/**
 * Create new Sim key
 */
SimApiController.createSimKey = function (req, res) {
  const key = req.body;
  if (!key.id || !key.title || !key.company_key) {
    utils.sendJSONresponse(res, 400, {
      "message": "id, title or company_key is missing"
    });
    return;
  }

  SimKey.create(key)
    .then((newKey) => {
      res.status(200).send(newKey)
    })
    .catch(err => {
      errorHandlers.dataBaseErrorHandler(err, res);
    });
};

/**
 * Update Sim Key
 */
SimApiController.updateSimKey = function (req, res) {
  const key = req.body;
  if (!key.id || !key.title || !key.company_key) {
    utils.sendJSONresponse(res, 400, {
      "message": "id, title or company_key is missing"
    });
    return;
  }
  SimKey.update(key, {
    where: { id: key.id }
  }).then(() => {
    res.status(200).send({ status: 'ok' });
  }).catch(function (err) {
    errorHandlers.dataBaseErrorHandler(err, res);
  });
}

/**
 * Remove Sim Key
 */
SimApiController.removeSimKey = function (req, res) {
  const id = req.body;
  SimKey.destroy({ where: { id: id }})
  .then(() => {
    res.status(200).send({message: 'Sim key Deleted!'});
  })
  .catch(function (error) {
    console.log(error);
    res.status(404).json(error);
  });
}

/**
 * Create new User Sim key map
 */
SimApiController.addUserSimKey = function (req, res) {
  const map = req.body;
  if (!map.user_id || !map.sim_key_id) {
    utils.sendJSONresponse(res, 400, {
      "message": "user_id or sim_key_id is missing"
    });
    return;
  }

  UserSimKeyMap.create(map)
    .then((map) => {
      res.status(200).send(map)
    })
    .catch(err => {
      errorHandlers.dataBaseErrorHandler(err, res);
    });
};

/**
 * Remove User Sim Key map
 */
SimApiController.removeUserSimKey = function (req, res) {
  const map = req.body;
  UserSimKeyMap.destroy({ where: { user_id: map.user_id, sim_key_id: map.sim_key_id }})
  .then(() => {
    res.status(200).send({message: 'User Sim key map Deleted!'});
  })
  .catch(function (error) {
    console.log(error);
    res.status(404).json(error);
  });
}

function getPfaKeys() {
  return Company.findAll({attributes: ['id', 'title', 'company_key']});
}

// Send keys to the neg-sim server
getPfaKeys()
  .then(function (keys) {
    simDelegate.commandSendAllPfaKeys(keys);
  });

module.exports = SimApiController;
