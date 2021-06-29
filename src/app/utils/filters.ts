import { User } from '@app/models';
import { fromIsoDate } from './helper';

/**
 * Returns true if there were no applied filters yet.
 */
export function isFiltersEmpty(appliedFilters: any): boolean {
  let isEmpty = true;
  for (const filterKey in appliedFilters) {
    if (appliedFilters.hasOwnProperty(filterKey) && appliedFilters[filterKey].length > 0) {
      isEmpty = false;
      break;
    }
  }
  return isEmpty;
}

/**
 * Sets to empty each array of filters in allFilters object.
 */
export function clearFiltersDataStorage(allFilters: any) {
  const allFiltersKeys = Object.keys(allFilters);
  allFiltersKeys.forEach(key => {
    allFilters[key] = [];
  });
}

/**
   * Returns array of users that matches all selected filters criterium.
   * @param targetArray (User[]: array of users belonged to selected key)
   * @param filters
   * @param currentFilterKey
   * @param changedFilterValues
   * @param addingFilterValue
   */
export function getFilteredParticipants(
  targetArray: User[],
  filters: Object,
  currentFilterKey: string,
  changedFilterValues: string[],
  addingFilterValue: boolean): User[] {

  const filterKeys = Object.keys(filters);

  return targetArray.filter(user => {
    let passed = true;
    for (let i = 0; i < filterKeys.length; i++) {
      const filterKey = filterKeys[i];

      if (filters[currentFilterKey].length === 0) {
        passed = false;
        break;
      }

      if (filters[filterKey].length === 0) {
        passed = true;
      } else {

        /**
        * If we added new filter value
        */
        if (addingFilterValue) {
          /**
          * Allow all users that with filter value that matches current selected filter to pass
          */
          passed = changedFilterValues.some((filterValue: string) => {
            /**
            * If user has no value for the selected filter, skip him
            */
            if ((currentFilterKey !== 'p_date' && !user[currentFilterKey]) ||
              (currentFilterKey === 'p_date' && !user['p_date2'] && !user[currentFilterKey])) {
              return false;
            }
            if (currentFilterKey === 'p_date') {
              return isUserPassingDateFilter(user, filterValue);
            } else {
              return isUserPassingFilter(user, currentFilterKey, filterValue);
            }
          });

          if (!passed) {
            /**
            * Then check if the user passes the previous selected filters
            */
            passed = filters[filterKey].some((filterValue: string) => {
              /**
              * If users has empty value for a filter we let him pass, if filterKey is different then changed one
              */
              if ((filterKey !== 'p_date' && !user[filterKey]) || (filterKey === 'p_date' && !user['p_date2'] && !user[filterKey])) {
                return filterKey !== currentFilterKey;
              }
              if (filterKey === 'p_date') {
                return isUserPassingDateFilter(user, filterValue);
              } else {
                return isUserPassingFilter(user, filterKey, filterValue);
              }
            });
          }

          /**
          * If the user didn't pass current filter, nor previous selected filters, skip him
          */
          if (!passed) {
            break;
          }
        } else {
          /**
          * If we removed filter value
          */

          /**
          * Skip all users that matched unselected filter value
          */
          passed = changedFilterValues.some((filterValue: string) => {
            if ((currentFilterKey !== 'p_date' && !user[currentFilterKey]) ||
              (currentFilterKey === 'p_date' && !user['p_date2'] && !user[currentFilterKey])) {
              return false;
            }
            if (currentFilterKey === 'p_date') {
              return !isUserPassingDateFilter(user, filterValue);
            } else {
              const valuesToCompare = splitValueByPattern(user[currentFilterKey]);
              let contains = false;
              filters[currentFilterKey].forEach(value => {
                if (valuesToCompare.find((v) => v === value)) {
                  contains = true;
                  return;
                }
              });
              return !isUserPassingFilter(user, currentFilterKey, filterValue) || contains;
            }
          });

          /**
          * If the user matched current unselected filter skip him
          */
          if (!passed) {
            break;
          }

          /**
          * Then check if the user passes the previous selected filters
          */
          passed = filters[filterKey].some((filterValue: string) => {
            /**
            * If users has empty value for a filter we let him pass, if filterKey is different then changed one
            */
            if ((filterKey !== 'p_date' && !user[filterKey]) || (filterKey === 'p_date' && !user['p_date2'] && !user[filterKey])) {
              return filterKey !== currentFilterKey;
            }
            if (filterKey === 'p_date') {
              return isUserPassingDateFilter(user, filterValue);
            } else {
              return isUserPassingFilter(user, filterKey, filterValue);
            }
          });

          /**
          * If the didn't match current unselected filter, but he also doesn't match other selected filters, skip him
          */
          if (!passed) {
            break;
          }
        }
      }
    }
    return passed;
  });
}

export function updateFilteredParticipants(allUsers: User[], filters: Object): User[] {
  const filterKeys = Object.keys(filters);
  const filteredUsers = JSON.parse(JSON.stringify(allUsers));

  return filteredUsers.filter(user => {
    let passed = false;
    for (let i = 0; i < filterKeys.length; i++) {
      const filterKey = filterKeys[i];

      if (filters[filterKey].length === 0) {
        passed = false;
      } else {
        passed = filters[filterKey].some((filterValue: string) => {
          if (filterKey === 'p_date') {
            return isUserPassingDateFilter(user, filterValue);
          } else {
            return isUserPassingFilter(user, filterKey, filterValue);
          }
        });

        if (passed) {
          break;
        }
      }
    }
    return passed;
  });
}

/** FUNCTIONS NEEDED TO FILL ARRAY OF USERS THAT MATCHES FILTERS CRITERIUMS */

/**
 * Returns true if user's <filterKey> property has the same value as <filterValue>
 * @param user (User)
 * @param filterKey (string: e.g. 'p_date', 'p_location'...)
 * @param filterValue (string: selected filter value)
 */
function isUserPassingFilter(user: User, filterKey: string, filterValue: string): boolean {
  let valuesToCompare;
  /**
   * as the user can have a few values in one field separated by some pattern, we check matching all of this value separately
   * to pass filter at least one of them should match
   */
  if (isNestedUserField(user, filterKey) && user[filterKey]) {
    valuesToCompare = splitValueByPattern(user[filterKey]['name']);
  } else if (user[filterKey]) {
    valuesToCompare = splitValueByPattern(user[filterKey]);
  }

  if (valuesToCompare) {
    for (let i = 0; i < valuesToCompare.length; i++) {
      const value = valuesToCompare[i];
      if (value === filterValue) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Returns true if user has 'p_date' or 'p_date2' property that value matches passed 'filterValue'
 * @param user (User)
 * @param filterValue (string: one of chosen 'date' filter value)
 */
function isUserPassingDateFilter(user: User, filterValue: string): boolean {
  if ((user.p_date && user.p_date.toString() === filterValue) ||
    (user.p_date2 && user.p_date2.toString() === filterValue)) {
    return true;
  }
  return false;
}
/**END */

/****************************************** */
/****************************************** */
/** FUNCTIONS NEEDED TO FILL FILTERS ARRAYS */
function getFiltersKeys(): string[] {
  const filtersFields: any = {
    p_location: [],
    p_date: [],
    p_groups: [],
    p_saved: []
  };

  return Object.keys(filtersFields);
}
export function getFiltersFieldsOfParticipants(users: User[]): any {
  const filtersFields: any = {
    p_location: [],
    p_date: [],
    p_groups: [],
    p_saved: []
  };

  fillAllFiltersDataStorage(users, filtersFields);

  return filtersFields;
}

/**
 * Fills each array in 'allFilters' object by values retreived from 'users' array.
 * @param users (User[] belonged to chosen key)
 * @param allFilters (Link to object with arrays for each filters categories, e.g.: p_date[], p_location[]...)
 */
export function fillAllFiltersDataStorage(users: User[], allFilters) {
  const allFiltersKeys = Object.keys(allFilters);
  clearFiltersDataStorage(allFilters);

  users.forEach(user => {
    allFiltersKeys.forEach(key => {
      if (!user[key] && key !== 'p_date') {
        return;
      }
      if (key === 'p_date') {
        fillDateCategory(allFilters[key], user);
      } else if (isNestedUserField(user, key)) {
        fillFilterCategory(allFilters[key], user[key].name);
      } else {
        fillFilterCategory(allFilters[key], user[key]);
      }
    });
  });
}

export function fillCorrespondingFiltersDataStorage(users: User[], appliedFilters, currentFilterKey: string) {
  const allFiltersKeys = getFiltersKeys();
  allFiltersKeys.forEach(key => {
    if (key !== currentFilterKey) {
      appliedFilters[key] = [];
    }
  });

  users.forEach(user => {
    allFiltersKeys.forEach(key => {
      if ((!user[key] && key !== 'p_date') || key === currentFilterKey) {
        return;
      }
      if (key === 'p_date') {
        fillDateCategory(appliedFilters[key], user);
      } else if (isNestedUserField(user, key)) {
        fillFilterCategory(appliedFilters[key], user[key].name);
      } else {
        fillFilterCategory(appliedFilters[key], user[key]);
      }
    });
  });
}

function fillFilterCategory(filtersCategoryValues: string[], newValue: string) {
  /**
   * User can have a few values in one field separated by some pattern, we push them in filters category separately
   */
  const valuesToCompare = splitValueByPattern(newValue);
  valuesToCompare.forEach(value => {
    if (!filtersCategoryValues.includes(value)) {
      filtersCategoryValues.push(value);
    }
  });
}

/**
 * Fills array with 'p_date' and 'p_date2' values from User object.
 * @param filtersCategoryValues (string[] for p_date and p_date2 values)
 * @param user (User)
 */
function fillDateCategory(filtersCategoryValues: any[], user: User) {
  if (user.p_date) {
    const obj = filtersCategoryValues.find(value => dateFormatter(value) === dateFormatter(user.p_date));
    if (!obj) {
      filtersCategoryValues.push(user.p_date.toString());
    }
  }
  if (user.p_date2) {
    const obj = filtersCategoryValues.find(value => dateFormatter(value) === dateFormatter(user.p_date2));
    if (!obj) {
      filtersCategoryValues.push(user.p_date2.toString());
    }
  }
}

/**COMMON FUNCTIONS */

/**
* Returns Formated date from ISO to format('DD-MMM-YY')
*/
function dateFormatter(param: any) {
  if (!param) { return ''; }
  return fromIsoDate(param);
}

function isNestedUserField(user: User, fieldKey: string): boolean {
  return typeof user[fieldKey] === 'object';
}

/**
 * Returns array from splited by ';' string.
 * Removes whitespace from both sides of strings in array.
 * @param value (string)
 */
function splitValueByPattern(value: string): string[] {
  const arr = value.split(';');
  for (let i = 0; i < arr.length; i++) {
    arr[i] = arr[i].trim();
  }
  return arr;
}
