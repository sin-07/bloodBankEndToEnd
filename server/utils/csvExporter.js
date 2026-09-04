const { createObjectCsvStringifier } = require('csv-writer');

/**
 * Export data to CSV format
 * @param {Array} data - Array of objects to export
 * @param {Array} headers - Array of { id, title } for column headers
 * @returns {string} CSV string
 */
const exportToCSV = async (data, headers) => {
  const csvStringifier = createObjectCsvStringifier({
    header: headers,
  });

  const headerString = csvStringifier.getHeaderString();
  const recordsString = csvStringifier.stringifyRecords(data);

  return headerString + recordsString;
};

module.exports = { exportToCSV };
