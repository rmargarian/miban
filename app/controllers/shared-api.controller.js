'use strict';
const { CareerCategory, Country, Currency, State } = require('../models');


let sharedEntities;
let SharedApiController = {};

SharedApiController.getAll = function (req, res) {
  if (!sharedEntities) {
    Promise.all([
      CareerCategory.findAll(),
      Country.findAll(),
      State.findAll(),
      Currency.findAll()
    ]).then(([careers, countries, states, currencies]) => {
      sharedEntities = {
        careers: careers,
        countries: countries,
        countriesStates: states,
        currencies: currencies
      };
      res.status(200).json(sharedEntities);
    }).catch(function (error) {
      console.log(error);
      res.status(404).json(error);
    });
  } else {
    res.status(200).json(sharedEntities);
  }

};

module.exports = SharedApiController;
