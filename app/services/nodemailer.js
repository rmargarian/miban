'use strict';
const nodemailer = require('nodemailer');
const config = require("../config/config");

/**
 * Create reusable transporter object using the default SMTP transport
 */
module.exports.transporter = nodemailer.createTransport({
  host: config.smtp_details.host,
  secure: false,
  port: config.smtp_details.port,
  auth: {
      user: config.smtp_details.user, // generated ethereal user
      pass: config.smtp_details.pass  // generated ethereal password
  },
  tls:{
    rejectUnauthorized:false
  },
  logger: true // log information in console
});


