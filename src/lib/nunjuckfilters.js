'use strict';

const moment = require('moment');

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}

/**
 * object used store the methods registered as a 'filter' (of the same name) within nunjucks
 * filter.foo("input") here, becomes {{ "input" | foo }} within nunjucks templates
 * @type {Object}
 */
const filter = {};

/**
 * logs an object in the template to the console on the client.
 * @param  {Any} a any type
 * @return {String}   a script tag with a console.log call.
 * @example {{ "hello world" | log }}
 * @example {{ "hello world" | log | safe }}  [for environments with autoescaping turned on]
 */
filter.log = function log(a) {
  return '<script>console.log(' + JSON.stringify(a, null, '\t') + ');</script>';
};

/**
 * Converts string to camel case
 * @param {String} any string
 * @return {String} a string
 * @example {{ "Hello There" | toCamelCase }} // helloThere
 */
filter.toCamelCase = function toCamelCase(s) {
  return s.trim().split(/-| /).reduce(function(pw, cw, i) {
    pw += (i === 0 ? cw[0].toLowerCase() : cw[0].toUpperCase()) + cw.slice(1);
    return pw;
  }, '');
};

/**
 * Hypthenates a string
 * @param {String} string to be converted
 * @return {String}
 * @example {{ "Hello there" | toHyphenated }} // hello-there
 */
filter.toHyphenated = function toHyphenated(s) {
  return s.trim().toLowerCase().replace(/\s+/g, '-');
};

/**
 * Highlights a phrase in a source piece of text
 * @param  {String} text    The original text to be updated
 * @param  {String} phrase  The phrase to highlight in the original text
 * @return {String}     The resulting text with highlights using <strong>
 */
filter.highlight = function highlight(text, phrase) {
  var regex = new RegExp( '(' + phrase + ')', 'gi' );
  return text.replace( regex, '<strong>$1</strong>' );
};

filter.attributeArray = function attributeArray(list) {

  if (!Array.isArray(list)) {
    return filter.attributeObject(list);
  }

  let result = '[';

  for (let iPos = 0; iPos < list.length - 1; iPos += 1) {
    result += '&#34;' + list[iPos] + '&#34;,';
  }

  result += '&#34;' + list[list.length - 1] + '&#34;]';

  return result;

};

filter.versionAssetUrl = function(asset) {
  let env = process.env.NODE_ENV || 'develop';
  if (env == 'production') {
    let pos = asset.lastIndexOf('.');
    if (pos !== -1) {
      asset = asset.substr(0, pos) + '.min' + asset.substr(pos);
    }
  }

  return `${asset}`;
};

filter.splitPart = function(value, seperator, part) {

  if (!value || value.length === 0) {
    return '';
  }

  let array = value.split('/');

  if (array && array.length < part) {
    return '';
  }

  return array[part];
};

filter.attributeObject = function(myObject) {
  let result = '{';

  for (var key in myObject) {
    result += `&#34;${key}&#34;:&#34;${myObject[key]}&#34;,`;
  }

  result = result.substr(0, result.length - 1) + '}';
  return result;
};

filter.humanFieldName = function(fieldName) {
  fieldName = fieldName.toLocaleLowerCase();
  fieldName = capitalizeFirstLetter(fieldName);
  fieldName = replaceAll(fieldName, '_', ' ');
  return fieldName;
};

function escapeRegExp(str) {
  if (str || str.length === 0) return str;
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

filter.highlightTerm = function highlightTerm(phrase, term = '') {
  try {
    if (!phrase) phrase = '';
    if (phrase.length === 0 || term.length === 0) return phrase;

    const cleanTerm = term.replace(/\*/g, '').replace(/\\/g, '\\\\');
    const regex = new RegExp(escapeRegExp(`(${cleanTerm})`), 'gi');
    return phrase.replace(regex, '<strong>$1</strong>');
  } catch (e) {
    return phrase;
  }
};


/**
 * creates rearranges values and creates new date object
 * @param  {String} d   A date string (must be) formatted yyyy-mm-dd
 * @return {String}     a javascript date string
 */
filter.newDate = function(d) {
  var dateArr = d.split('-');
  return dateArr.length === 3 ? new Date(dateArr[0], parseInt(dateArr[1]) - 1, dateArr[2]) : NaN;
};

/**
 * returns a standard gov.uk date from a string using momentjs
 * moment documentation: http://momentjs.com/docs/
 * @method function
 * @param  {string} d date e.g 09/12/1981 or 9-12-1981
 * @param  {string} f moment.js format string (to override the default if needed)
 * @return {string} date string as per the current gov.uk standard 09/12/1981 -> 09 December 1981
 */
filter.formatDate = function(d, f) {

  let formatted;

  if (f) {
    formatted = moment(d, moment.ISO_8601).format(f);
  } else if (d && d.length > 0 && d.length < 11) {
    formatted = moment(filter.newDate(d)).locale('en-gb').format(f ? f : 'LL');
  } else {
    formatted = moment(d, moment.ISO_8601).format('DD MMMM YYYY, h:mm:ss a');
  }

  if (formatted === 'Invalid date') {
    return '';
  }

  return formatted;
};

/**
 * returns a standard gov.uk date from an epoch using momentjs
 * moment documentation: http://momentjs.com/docs/
 * @method function
 * @param  {string} d date e.g 1462834800000
 * @param  {string} f moment.js format string (to override the default if needed)
 * @return {string} date string as per the current gov.uk standard 09/12/1981 -> 09 December 1981
 */
filter.date = function( date, format ) {

  format = ( format || 'DD MMMM YYYY, h:mm:ss a' );

  let formatted = moment( date ).format( format );

  if (formatted === 'Invalid date') {
    return '';
  }

  return formatted;
};


filter.pluralise = function(number, string){
  if (number != 1) {
    string += 's';
  }

  return number + ' ' + string;
};


module.exports = filter;
