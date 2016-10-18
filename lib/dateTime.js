var moment = require('moment-timezone');
var timezone = 'Europe/London';

function format(date) {
  if (typeof date !== 'object') date = new Date(date);
  return moment(date).tz(timezone).format();
}

function isDST(date) {
  if (typeof date !== 'object') date = new Date(date);
  return moment(date).tz(timezone).isDST();
}

function toGMT(date) {
  // if a date is in summer time, return as GMT, ie with an hour deducted
  var result = date;
  if (moment(date).tz(timezone).isDST()) result = new Date(date.getTime() - 3600000);
  return result;
}

function getRippleTime(date, host) {
  console.log('*** host = ' + host);
  if (date === '') return date;
  var dt = new Date(date);
  if (host === 'ethercis') dt = toGMT(dt);
  return dt.getTime();
}

function msSinceMidnight(date, host, GMTCheck) {
  var e = new Date(date);
  //if (host === 'ethercis') e = toGMT(e);
  if (GMTCheck) e = toGMT(e);
  return e.getTime() - e.setHours(0,0,0,0);
}

function msAtMidnight(date, host, GMTCheck) {
  var e = new Date(date);
  //if (host === 'ethercis') e = toGMT(e);
  if (GMTCheck) e = toGMT(e);
  return e.setHours(0,0,0,0);
}

module.exports = {
  format: format,
  isDST: isDST,
  toGMT: toGMT,
  msSinceMidnight: msSinceMidnight,
  msAtMidnight: msAtMidnight,
  getRippleTime: getRippleTime
};