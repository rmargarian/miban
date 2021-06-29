var colors = require('colors/safe');

module.exports.dataBaseErrorHandler = function (err, res) {
  console.error(err);
  res.status(500).json(new Error('Something went wrong'));
};

module.exports.printError = function (err) {
  console.log(colors.red(err));
  process.exit();
};

