import { format, parseISO, addDays, addMonths, addYears, isBefore, isAfter, isEqual, differenceInDays, differenceInHours, differenceInMinutes, formatDistanceToNow } from 'date-fns';

/**
 * Format a date to a human-readable string
 * @param {Date|string|number} date - Date to format
 * @param {string} [formatStr='PPpp'] - Format string (see date-fns format)
 * @returns {string} Formatted date string
 */
const formatDate = (date, formatStr = 'PPpp') => {
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Parse a date string to a Date object
 * @param {string} dateString - Date string to parse
 * @returns {Date} Parsed date
 */
const parseDate = (dateString) => {
  return parseISO(dateString);
};

/**
 * Add days to a date
 * @param {Date|string|number} date - Start date
 * @param {number} days - Number of days to add
 * @returns {Date} New date with days added
 */
const addDaysToDate = (date, days) => {
  const dateObj = date instanceof Date ? date : new Date(date);
  return addDays(dateObj, days);
};

/**
 * Add months to a date
 * @param {Date|string|number} date - Start date
 * @param {number} months - Number of months to add
 * @returns {Date} New date with months added
 */
const addMonthsToDate = (date, months) => {
  const dateObj = date instanceof Date ? date : new Date(date);
  return addMonths(dateObj, months);
};

/**
 * Add years to a date
 * @param {Date|string|number} date - Start date
 * @param {number} years - Number of years to add
 * @returns {Date} New date with years added
 */
const addYearsToDate = (date, years) => {
  const dateObj = date instanceof Date ? date : new Date(date);
  return addYears(dateObj, years);
};

/**
 * Check if a date is before another date
 * @param {Date|string|number} date - Date to check
 * @param {Date|string|number} dateToCompare - Date to compare against
 * @returns {boolean} True if date is before dateToCompare
 */
const isDateBefore = (date, dateToCompare) => {
  const dateObj = date instanceof Date ? date : new Date(date);
  const compareObj = dateToCompare instanceof Date ? dateToCompare : new Date(dateToCompare);
  return isBefore(dateObj, compareObj);
};

/**
 * Check if a date is after another date
 * @param {Date|string|number} date - Date to check
 * @param {Date|string|number} dateToCompare - Date to compare against
 * @returns {boolean} True if date is after dateToCompare
 */
const isDateAfter = (date, dateToCompare) => {
  const dateObj = date instanceof Date ? date : new Date(date);
  const compareObj = dateToCompare instanceof Date ? dateToCompare : new Date(dateToCompare);
  return isAfter(dateObj, compareObj);
};

/**
 * Check if two dates are equal
 * @param {Date|string|number} date1 - First date
 * @param {Date|string|number} date2 - Second date
 * @returns {boolean} True if dates are equal
 */
const areDatesEqual = (date1, date2) => {
  const dateObj1 = date1 instanceof Date ? date1 : new Date(date1);
  const dateObj2 = date2 instanceof Date ? date2 : new Date(date2);
  return isEqual(dateObj1, dateObj2);
};

/**
 * Get the difference in days between two dates
 * @param {Date|string|number} date1 - First date
 * @param {Date|string|number} date2 - Second date
 * @returns {number} Difference in days
 */
const getDaysDifference = (date1, date2) => {
  const dateObj1 = date1 instanceof Date ? date1 : new Date(date1);
  const dateObj2 = date2 instanceof Date ? date2 : new Date(date2);
  return Math.abs(differenceInDays(dateObj1, dateObj2));
};

/**
 * Get the difference in hours between two dates
 * @param {Date|string|number} date1 - First date
 * @param {Date|string|number} date2 - Second date
 * @returns {number} Difference in hours
 */
const getHoursDifference = (date1, date2) => {
  const dateObj1 = date1 instanceof Date ? date1 : new Date(date1);
  const dateObj2 = date2 instanceof Date ? date2 : new Date(date2);
  return Math.abs(differenceInHours(dateObj1, dateObj2));
};

/**
 * Get the difference in minutes between two dates
 * @param {Date|string|number} date1 - First date
 * @param {Date|string|number} date2 - Second date
 * @returns {number} Difference in minutes
 */
const getMinutesDifference = (date1, date2) => {
  const dateObj1 = date1 instanceof Date ? date1 : new Date(date1);
  const dateObj2 = date2 instanceof Date ? date2 : new Date(date2);
  return Math.abs(differenceInMinutes(dateObj1, dateObj2));
};

/**
 * Get a human-readable relative time string (e.g., "2 hours ago")
 * @param {Date|string|number} date - Date to format
 * @returns {string} Relative time string
 */
const getRelativeTime = (date) => {
  const dateObj = date instanceof Date ? date : new Date(date);
  return formatDistanceToNow(dateObj, { addSuffix: true });
};

/**
 * Check if a date is within a date range (inclusive)
 * @param {Date|string|number} date - Date to check
 * @param {Date|string|number} startDate - Start of range
 * @param {Date|string|number} endDate - End of range
 * @returns {boolean} True if date is within the range
 */
const isDateInRange = (date, startDate, endDate) => {
  const dateObj = date instanceof Date ? date : new Date(date);
  const startObj = startDate instanceof Date ? startDate : new Date(startDate);
  const endObj = endDate instanceof Date ? endDate : new Date(endDate);
  
  return (isAfter(dateObj, startObj) || isEqual(dateObj, startObj)) && 
         (isBefore(dateObj, endObj) || isEqual(dateObj, endObj));
};

/**
 * Get the start of the day for a given date
 * @param {Date|string|number} [date=new Date()] - Date to get start of day for
 * @returns {Date} Start of the day (00:00:00)
 */
const startOfDay = (date = new Date()) => {
  const dateObj = date instanceof Date ? new Date(date) : new Date(date);
  dateObj.setHours(0, 0, 0, 0);
  return dateObj;
};

/**
 * Get the end of the day for a given date
 * @param {Date|string|number} [date=new Date()] - Date to get end of day for
 * @returns {Date} End of the day (23:59:59.999)
 */
const endOfDay = (date = new Date()) => {
  const dateObj = date instanceof Date ? new Date(date) : new Date(date);
  dateObj.setHours(23, 59, 59, 999);
  return dateObj;
};

/**
 * Get the current date and time as a string in ISO format
 * @returns {string} Current date and time in ISO format
 */
const getCurrentISODate = () => {
  return new Date().toISOString();
};

export {
  formatDate,
  parseDate,
  addDaysToDate,
  addMonthsToDate,
  addYearsToDate,
  isDateBefore,
  isDateAfter,
  areDatesEqual,
  getDaysDifference,
  getHoursDifference,
  getMinutesDifference,
  getRelativeTime,
  isDateInRange,
  startOfDay,
  endOfDay,
  getCurrentISODate,
};
