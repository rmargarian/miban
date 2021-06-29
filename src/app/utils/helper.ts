import * as moment from 'moment';
import { User, Keys, Questionnaire, QuestionGroup } from '@app/models';
import { Md5 } from 'ts-md5/dist/md5';

import { TOKEN } from '@app/contants';

/**
 * Utility function pads the number to two places adding a leading zero if necessary.
 */
export function pad2(number: number): string {
  return (number < 10 ? '0' : '') + number;
}

/**
 * Utility function returns 'string' from ISO date (formated in 'DD-MMM-YY').
 * @param iso (Date in ISO format)
 */
export function fromIsoDate(iso: Date): string {
  // return empty string if date is null
  let date = '';
  try {
    //if (iso && !isNaN(iso.getDate())) {
    if (iso) {
      date = moment(iso).format('DD-MMM-YY');
    }
    return date;
  } catch (error) {
    return '';
  }
}

/**
 * Returns date in format 'DD-MMM-YY'
 * @param date (Date)
 */
export function formatDate(date: Date): string {
  const d = moment(date).format('DD-MMM-YY');
  return d;
}

/**
 * Create acronym (if not set) from title
 * @param title (Questionnaire title)
 */
export function setAcronym(title: string) {
  const res = title.split(' ');
  let ac = '';
  res.forEach(word => {
    ac += word.slice(0, 1);
  });
  return ac;
}

/**
 * Check if at least one User has some status for Questionnaire
 * @param id (Questionnaire id)
 * @param rowData (User[])
 */
export function checkIfNotOneStatusExists(id: number, rowData: User[]): boolean {
  for (const user of rowData) {
    for (const attempt of (<any>user).attempts) {
      if (attempt.questionnaire_id === id) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Use to sort date values correctly in table
 * @param params (valueA, valueB)
 */
export function dateComparator(valueA, valueB) {
  return new Date(valueA).getTime() - new Date(valueB).getTime();
}

/**
 * Sort dates stored in DB as string field in formate 'YYYY-MM-DD'
 */
export function dateStringComparator(valueA, valueB) {
  valueA = valueA || '1';
  valueB = valueB || '1';
  return valueA.toLowerCase().localeCompare(valueB.toLowerCase());
}

/**
 * Utility function overrides default ag-grid sorting
 * @param value_a
 * @param value_b
 */
export function gridComparator (value_a: any, value_b: any) {
  value_a = (value_a || value_a === 0) ? value_a : 'z';
  value_b = (value_b || value_b === 0) ? value_b : 'z';
  if (typeof value_a === 'string' && typeof value_b === 'string') {
    return value_a.toLowerCase().replace(/<[^>]*>/g, '').localeCompare(value_b.toLowerCase().replace(/<[^>]*>/g, ''));
  } else if (typeof value_a === 'number' && typeof value_b === 'number') {
    return value_a - value_b;
  }
}

/**
 * Utility function returns sessionId for user's POST requests (TOKEN  encrypted with Md5)
 */
export function getSessionId(): string {
  const token = <string>Md5.hashStr(TOKEN);
  return token;
}

/**
 * Utility function returns value  encrypted with Md5
 */
export function getMd5Value(value: string): string {
  const token = <string>Md5.hashStr(value);
  return token;
}

/**
 * Utility function retreives Questionnaire object (or null) from 'company-questionnaire-maps' array,
 * included in 'Keys' object.
 * ('company-questionnaire-maps' it's a list of all activated Questionnaires for particular key,
 * each 'company-questionnaire-map' includes Questionnaire)
 * @param qId (questionnaire Id)
 */
export function getQuestionnaireFromKey(qId: number, key: Keys): Questionnaire {
  for (const element of key['company-questionnaire-maps']) {
    if (element.questionnaire_id === qId) {
      return element.questionnaire;
    }
  }
  return null;
}

/**
 * Transforms time from value in minutes => h m s
 * @param value (Time in minuts)
 */
export function transformTime(value: number): string {
  if (!value) { return '0'; }

  const hours: number = Math.floor(value / 60 / 60);
  const minutes: number = Math.floor((value - hours * 60 * 60) / 60);
  const seconds = value - (hours * 60 * 60) - (minutes * 60);

  return hours.toString().padStart(2, '0') + 'h ' +
         minutes.toString().padStart(2, '0') + 'm ' +
         seconds.toString().padStart(2, '0') + 's';
}

/**
 * Transforms time from value in minutes => h m s
 * @param value (Time in minuts)
 */
export function transformTimeWithCheck(value: number): string {
  const hours: number = Math.floor(value / 60 / 60);
  const minutes: number = Math.floor((value - hours * 60 * 60) / 60);
  const seconds = value - (hours * 60 * 60) - (minutes * 60);

  let timeString = hours.toString().padStart(2, '0') + 'h';
  if (minutes || seconds) { timeString += ' ' + minutes.toString().padStart(2, '0') + 'm'; }
  if (seconds) { timeString += ' ' + seconds.toString().padStart(2, '0') + 's'; }

  return timeString;
}

export function isIE() {
  const ua = navigator.userAgent;
  /* MSIE used to detect old browsers and Trident used to newer ones*/
  const is_ie = ua.indexOf('MSIE ') > -1 || ua.indexOf('Trident/') > -1;

  return is_ie;
}

/**
 * Utility function returns browser name found from navigator.userAgent
 * @param agent (string)
 */
export function getBrowserName(agent: string): string {
  if (/Edge\/\d./i.test(agent)) {
    return 'Microsoft Edge';
  } else if ((agent.indexOf('Opera') || agent.indexOf('OPR')) !== -1) {
    return 'Opera';
  } else if (agent.indexOf('Chrome') !== -1) {
    return 'Chrome';
  } else if (agent.indexOf('Safari') !== -1) {
    return 'Safari';
  } else if (agent.indexOf('Firefox') !== -1) {
    return 'Firefox';
  } else if (agent.indexOf('MSIE ') > -1 || agent.indexOf('Trident/') > -1) {
    return 'IE';
  } else {
    return 'unknown';
  }
}

/**
 * Determine the mobile operating system.
 * This function returns one of 'iOS', 'Android', 'Windows Phone', or undefined.
 * @returns {string}
 */
export function getMobileOperatingSystem(): string {
  const userAgent = navigator.userAgent || navigator.vendor || (<any>window).opera;

  // Windows Phone must come first because its UA also contains "Android"
  if (/windows phone/i.test(userAgent)) {
    return 'Windows Phone';
  }

  if (/android/i.test(userAgent)) {
    return 'Android';
  }

  // iOS detection from: http://stackoverflow.com/a/9039885/177710
  if (/iPad|iPhone|iPod/.test(userAgent) && !(<any>window).MSStream) {
    return 'iOS';
  }

  return undefined;
}

/**
 * Fills validUsers array if user in users array is valid:
 * - has first_name, last_name, email,
 * - email is valid
 * Parse date from file (if not empty) and configures Date object.
 * Adds company_id for not existing users (we shouldn't move existing user to another key)
 * @param users (User[])
 * @param companyId (Company id)
 * @returns User[]
 */
export function validateUsers (users, companyId) {
  const validUsers = [];
  const emailRegex = /^[a-zA-Z0-9][a-zA-Z0-9-_\.]+@((([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const nameRegex = /^[a-z][a-z\s-\']*$/i;
  users.forEach(function(us) {
    const user = JSON.parse(JSON.stringify(us));
    const obj = validUsers.find(function (u)  {return u.email === user.email;});
    // Configure correct Date
    if (user.p_date) {
      const parts = user.p_date.toString().split('/');
      const timestamp = Date.parse(parts[1] + '/' + parts[0] + '/' + parts[2]);
      if (!isNaN(timestamp)) {
        user.p_date = moment(new Date(timestamp)).format('YYYY-MM-DD');
      } else {
        user.p_date = '';
      }
    }
    // Add company_id for not existing users
    if (!user.id) {
      user.company_id = companyId;
    }

    if (user.first_name && user.last_name && user.email &&
      emailRegex.test(user.email) && nameRegex.test(user.last_name) &&
      nameRegex.test(user.first_name) && !obj) {
      validUsers.push(user);
    }
  });

  return validUsers;
}

/**
 * Utulity function returns:
 * true: if array doesn't contain any data by passed property
 */
export function isColumnEmpty(array: any[], property: string) {
  const fields = property.split('.');
  for (const user of array) {
    if (fields.length === 1 && user[fields[0]]) { return false; }
    else if (fields.length === 2 && user[fields[0]] && user[fields[0]][fields[1]]) { return false; }
  }
  return true;
}
