'use strict';

const $ = require('cheerio');
const svg2png = require('svg2png');
const {_} = require('lodash');

module.exports.png3x = function (path, color, width, height) {
  return png(path, color, width, height, 3);
};

function png(path, color, width, height, size) {
  let str = svg(path, color);
  width = parseInt(width, 10) || 18;
  height = parseInt(height, 10) || 18;
  size = parseInt(size, 10) || 1;
  if (!_.isNumber(width)) throw new Error('fa.png width must be a number');
  if (!_.isNumber(height)) throw new Error('fa.png height must be a number');
  str = svg2png.sync(new Buffer(str, 'utf8'), {
    width: parseInt(width * size, 10),
    height: parseInt(height * size, 10)
  });
  let $img = $('<img>');
  $img.attr('width', width);
  $img.attr('height', height);
  $img.attr('style', 'vertical-align: top;');
  $img.attr('src', `data:image/png;base64,${str.toString('base64')}`);
  return $.html($img);
}

function svg(path, color) {
  color = color || '#000';

  let $svg = $('<svg>', {
    xmlMode: true
  });
  $svg.attr('xmlns', 'http://www.w3.org/2000/svg');
  $svg.attr('width', '100%');
  $svg.attr('height', '100%');
  $svg.attr('viewBox', `0 0 500 500`);
  $svg.append(`<path fill="${color}" d="${path}" />`);

  return $.html($svg);
}
