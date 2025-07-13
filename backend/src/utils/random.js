import crypto from 'crypto';

/**
 * Generate a cryptographically secure random string
 * @param {number} length - Length of the random string to generate
 * @param {Object} [options] - Options for string generation
 * @param {boolean} [options.uppercase=true] - Include uppercase letters
 * @param {boolean} [options.lowercase=true] - Include lowercase letters
 * @param {boolean} [options.numbers=true] - Include numbers
 * @param {boolean} [options.special=false] - Include special characters
 * @param {string} [options.charset] - Custom character set to use
 * @returns {string} - Randomly generated string
 */
const generateRandomString = (
  length = 32,
  { 
    uppercase = true, 
    lowercase = true, 
    numbers = true, 
    special = false,
    charset
  } = {}
) => {
  // Define character sets
  const charSets = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    special: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  };

  // Create the character set based on options
  let charSet = charset || '';
  
  if (!charset) {
    if (uppercase) charSet += charSets.uppercase;
    if (lowercase) charSet += charSets.lowercase;
    if (numbers) charSet += charSets.numbers;
    if (special) charSet += charSets.special;
    
    // If no character set is selected, use alphanumeric
    if (!charSet) {
      charSet = charSets.lowercase + charSets.uppercase + charSets.numbers;
    }
  }

  // Ensure we have a valid character set
  if (!charSet || charSet.length === 0) {
    throw new Error('No character set available for generating random string');
  }

  // Generate random bytes and map them to our character set
  const randomBytes = crypto.randomBytes(length);
  const result = [];
  
  for (let i = 0; i < length; i++) {
    const randomIndex = randomBytes[i] % charSet.length;
    result.push(charSet.charAt(randomIndex));
  }
  
  return result.join('');
};

/**
 * Generate a random number in the specified range (inclusive)
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {number} - Random number in the specified range
 */
const generateRandomNumber = (min, max) => {
  const range = max - min + 1;
  const randomBytes = crypto.randomBytes(4);
  const randomValue = randomBytes.readUInt32BE(0) / 0xffffffff; // 0-1
  return Math.floor(randomValue * range) + min;
};

/**
 * Generate a random boolean value
 * @param {number} [probability=0.5] - Probability of returning true (0-1)
 * @returns {boolean} - Random boolean
 */
const generateRandomBoolean = (probability = 0.5) => {
  return Math.random() < probability;
};

/**
 * Generate a random item from an array
 * @template T
 * @param {T[]} array - Array of items to choose from
 * @returns {T} - Random item from the array
 */
const generateRandomItem = (array) => {
  if (!Array.isArray(array) || array.length === 0) {
    throw new Error('Input must be a non-empty array');
  }
  
  const randomIndex = generateRandomNumber(0, array.length - 1);
  return array[randomIndex];
};

/**
 * Generate a random date within a range
 * @param {Date} [startDate] - Start date (defaults to 1 year ago)
 * @param {Date} [endDate] - End date (defaults to now)
 * @returns {Date} - Random date within the specified range
 */
const generateRandomDate = (startDate, endDate) => {
  const start = startDate || new Date();
  start.setFullYear(start.getFullYear() - 1); // Default to 1 year ago
  
  const end = endDate || new Date();
  
  const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(randomTime);
};

/**
 * Generate a random password with default strong settings
 * @param {number} [length=16] - Length of the password
 * @returns {string} - Randomly generated password
 */
const generatePassword = (length = 16) => {
  return generateRandomString(length, {
    uppercase: true,
    lowercase: true,
    numbers: true,
    special: true
  });
};

/**
 * Generate a random token (URL-safe base64)
 * @param {number} [byteLength=32] - Number of random bytes to generate
 * @returns {string} - URL-safe base64 encoded token
 */
const generateToken = (byteLength = 32) => {
  return crypto
    .randomBytes(byteLength)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

export {
  generateRandomString,
  generateRandomNumber,
  generateRandomBoolean,
  generateRandomItem,
  generateRandomDate,
  generatePassword,
  generateToken,
};
