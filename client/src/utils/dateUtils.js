import moment from 'moment';

export const formatDate = (date) => {
  if (!date) return "";

  const momentDate = moment(date);
  return momentDate.isValid() ? momentDate.format('YYYY-MM-DD') : "";
};