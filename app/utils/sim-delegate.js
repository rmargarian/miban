'use strict';
const request = require('request');
const Q = require('q');
const config = require('../config/config');

/**
 * Sends http request
 * @param api
 * @param jsonData
 * @param callback
 */
const sendRequest = function (api, jsonData) {
    const options = {
        url: config.sim.apiUrl + 'pfa/' + api,
        method: 'POST',
        json: true,
        headers: {
            'Content-Type': "application/json",
            'x-negotiation-pfa-token': config.sim.authKey.toSIM
        },
        body: jsonData
    }

    const deferred = Q.defer();

    request(options, (error, response, body) => {
        deferred.resolve({response: response, body: body});
    });

    return deferred.promise;
};

/**
 * Delegate for sending http requests to NegSim server.
 * In all requests keys should be send with 'id', even in CREATE case.
 * So after the key was created on one side it should be created on another with the same id.
 */
const simDelegate = {
    /**
     * Retrieve full list of Pfa keys
     * @param {*} data - Company[] ('companies' table) (fields: 'id', 'title', 'company_key')
     * @param {*} callback
     */
    commandSendAllPfaKeys: function(data, callback) {
        return sendRequest('all-pfa-keys', data, callback);
    },

    /**
     * Send create Pfa key request
     * @param {*} data - Company Object ('companies' table) (fields: 'id', 'title', 'company_key')
     * @param {*} callback
     */
    commandCreatePfaKey: function(data, callback) {
        sendRequest('create-pfa-key', getShortPfaKey(data), callback);
    },

    /**
     * Send update Pfa key request
     * @param {*} data
     * @param {*} callback
     */
    commandUpdatePfaKey: function(data, callback) {
        sendRequest('update-pfa-key', getShortPfaKey(data), callback);
    },

    /**
     * Send remove Pfa key request
     * @param {id} data
     * @param {*} callback
     */
    commandRemovePfaKey: function(data, callback) {
        sendRequest('remove-pfa-key', data, callback);
    },

    /**
     * Send update users Pfa key request
     * @param {keyId, userIds} data
     * @param {*} callback
     */
    commandUpdateUsersPfaKey: function(data, callback) {
      sendRequest('update-users-pfa-key', data, callback);
  }
};

/**
 * Returns pfa key with fields required in Sim pfa_key
 * @param {Company} key
 */
function getShortPfaKey(key) {
  return {id: key.id, title: key.title, company_key: key.company_key};
}

module.exports = simDelegate;
