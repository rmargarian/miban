const fx = require('money');
const configs = require('../config/config');
const request = require('request');

/**
 * Get relevant currencies from data.fixer.io API
 * @returns {Promise}
 */
module.exports.updateCurrencies = function () {
  return new Promise((resolve, reject) => {
    const options = {
      url: 'http://data.fixer.io/api/latest?access_key=' + configs.fixerApiKey
    };

    request(options.url, { json: true }, (err, res, body) => {
      if (err) { return reject(err); }
      fx.base = body.base;
      fx.rates = body.rates;
      resolve();
    });
  });
};

/**
 * Converter of currencies. Check from and to parameters possible values at data.fixer.io --> Supported Symbols Endpoint
 * @param value
 * @param from
 * @param to
 * @returns {number}
 */
module.exports.convertCurrency = function (value, from, to) {
  return Math.round(fx.convert(parseFloat(value), {from: from, to: to}));
};
