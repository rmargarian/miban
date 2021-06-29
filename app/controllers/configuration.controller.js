'use strict';

const config = require('../config/config');
const {Config} = require('../models');

let ConfigurationController = {};

ConfigurationController.getAll = function (req, res) {
  Config.findAll()
    .then((rows) => {
      res.status(200).json(rows);
    })
    .catch(err => {
      res.status(404).json(err);
    });
};

ConfigurationController.update = function (req, res) {

  let toUpdateData = req.body;
  let updateQueryPromises = [];
  for (let key in toUpdateData) {
    if (toUpdateData.hasOwnProperty(key)) {
      updateQueryPromises.push(
        Config.update(
          {value: toUpdateData[key]},
          {where: {id: key}}
        ));
    }
  }

  Promise.all(updateQueryPromises)
    .then(function () {
      res.status(200).end();
    });
};

ConfigurationController.getUserUrl = function (req, res) {
  res.status(200).json(config.user_url);
};

module.exports = ConfigurationController;
