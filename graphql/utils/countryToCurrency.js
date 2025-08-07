// utils/countryToCurrency.js

const countryToCurrency = {
  IN: "INR",
  US: "USD",
  GB: "GBP",
  CA: "CAD",
  AU: "AUD",
  AE: "AED",
  DE: "EUR",
  FR: "EUR",
  JP: "JPY",
};

function getCurrencyFromCountry(countryCode) {
  return countryToCurrency[countryCode] || "INR"; // Default fallback
}

module.exports = { getCurrencyFromCountry };
