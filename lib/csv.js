import XLSX from 'xlsx-js-style';

/**
 * Export data to a well-formatted Excel (.xlsx) file
 * @param {Array} data - Array of row objects
 * @param {Array} headers - Array of { id, title }
 * @returns {Buffer} xlsx file buffer
 */
export const exportToCSV = (data, headers) => {
  const wb = XLSX.utils.book_new();

  // Build worksheet as array of cell-object rows for full type control
  const wsRows = [];

  // Header row
  const headerRow = headers.map((h) => ({
    t: 's',
    v: h.title,
    s: {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: 'C0392B' } },
      alignment: { horizontal: 'center', vertical: 'center' },
    },
  }));
  wsRows.push(headerRow);

  // Data rows — force strings for phone/id-like values to prevent scientific notation
  for (const row of data) {
    const cells = headers.map((h) => {
      const val = row[h.id] ?? '';
      const strVal = String(val);
      // Store as text if: it's a string with 7+ digits or explicitly a string type
      const isNumericString =
        typeof val === 'string' && /^\d{7,}$/.test(strVal);
      const isLargeNumber = typeof val === 'number' && val > 9999999;
      if (isNumericString || isLargeNumber) {
        return { t: 's', v: strVal }; // force text
      }
      return { t: typeof val === 'number' ? 'n' : 's', v: val === '' ? '' : val };
    });
    wsRows.push(cells);
  }

  // Convert rows to worksheet
  const ws = {};
  let maxRow = wsRows.length;
  let maxCol = headers.length;

  for (let R = 0; R < wsRows.length; R++) {
    for (let C = 0; C < wsRows[R].length; C++) {
      const cellAddr = XLSX.utils.encode_cell({ r: R, c: C });
      ws[cellAddr] = wsRows[R][C];
    }
  }
  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: maxRow - 1, c: maxCol - 1 } });

  // Auto column widths
  ws['!cols'] = headers.map((h, colIdx) => {
    const maxLen = Math.max(
      h.title.length,
      ...data.map((row) => String(row[h.id] ?? '').length)
    );
    return { wch: Math.min(Math.max(maxLen + 4, 14), 45) };
  });

  // Header row height
  ws['!rows'] = [{ hpt: 24 }];

  XLSX.utils.book_append_sheet(wb, ws, 'Report');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
};


