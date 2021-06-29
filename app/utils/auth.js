'use strict';

const crypto = require('crypto');
const config = require('../config/config');

const helpers = {};

/** Function that checks if the request is authenticated or not.*/
helpers.isAuthenticated = function (req, res, next) {
  const sessionId = req.query.sessionId || req.body.sessionId;
  if (!sessionId) {
    res.status(401);
    res.send({
      status: 'error',
      error: 'Not Authorized.'
    });
  } else {
    const sessId = helpers.encrypt(config.TOKEN);
    if (sessId === sessionId) {
      next();
    } else {
      res.status(401);
      res.send({
        status: 'error',
        error: 'Not Authorized.'
      });
    }
  }
}

/**
 * Utility function returns sessionId (value  encrypted with Md5)
 * @param value (string)
 */
helpers.encrypt = function (value) {
  const encrypted = crypto.createHash('md5').update(value).digest('hex');
  return encrypted;
}

/**Checks if token in SIM request is valid */
helpers.validateSimToken = function(request, response, next) {
  if(
      request && request.headers &&
      request.headers['x-negotiation-sim-token'] &&
      request.headers['x-negotiation-sim-token'] === config.sim.authKey.fromSIM
  ) {
      next();
  }
  else {
      response.status(403).send('You are not allowed to see this page');
  }
};

module.exports = helpers;
