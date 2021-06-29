export function formatUserInfo(user) {
  /**In old reports fullName was used instead of firstName */
  const name = user.fullName ? user.fullName : user.firstName;
  let userInfo = (name || '') + ' ' + (user.lastName || '') + ' - ';

  if (user.jobTitle) {
    userInfo += user.jobTitle + ' - ';
  }

  if (user.city) {
    userInfo += ' ' + user.city;
  }

  if (user.stateName) {
    userInfo += ' ' + user.stateName;
  }

  if (user.country && user.country.name) {
    userInfo += ' ' + user.country.name;
  }

  if (user.organization) {
    userInfo += ' - ' + user.organization;
  }

  if (user.department) {
    userInfo += ' - ' + user.department;
  }

  if (user.managerName) {
    userInfo += ' - ' + user.managerName;
  }

  return userInfo;
}
