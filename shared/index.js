'use strict';

/**
 * Add clone/copy counter suffix to a field based on provided counter value.
 * @param {string} field
 * @param {number} count
 * @param {string} postfix
 * @returns {string}
 */
var setCloneSuffix = function(field, count, postfix) {
  if (count === 0) {
    return field += postfix;
  } else {
    var cloneSuffixIndex = field.indexOf(postfix);
    if (cloneSuffixIndex === -1) {
      return field += ' - Clone (' + count + ')';
    } else if (field.indexOf('(', cloneSuffixIndex) === -1) {
      return field += ' (' + count + ')';
    } else {
      var splited = field.split(/([()])/).filter(function(val) { return val !== ''; });
      splited[splited.length - 2] = (count).toString();
      return splited.join('');
    }
  }
};

if (typeof exports === "object" && typeof module !== "undefined") {
  module.exports.setCloneSuffix = setCloneSuffix;
}

