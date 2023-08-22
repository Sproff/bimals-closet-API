const { nanoid } = require('nanoid');

const generateShortCode = () => {
  const minLength = 8;
  let shortCode = nanoid(minLength);

  while (!/[A-Z]/.test(shortCode) || !/\d/.test(shortCode)) {
    // If generated short code doesn't have at least one capital letter and one number
    // Regenerate the short code
    shortCode = nanoid(minLength);
  }

  return shortCode;
};
module.exports = { generateShortCode };
