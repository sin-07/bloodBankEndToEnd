const PDFDocument = require('pdfkit');

/**
 * Generate a donation certificate PDF
 * @param {Object} data - Certificate data
 * @returns {Promise<Buffer>} PDF buffer
 */
const generateDonationCertificate = (data) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: { top: 50, bottom: 50, left: 60, right: 60 },
      });

      const buffers = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // ========================
      // Certificate Design
      // ========================

      // Border
      doc
        .rect(30, 30, doc.page.width - 60, doc.page.height - 60)
        .lineWidth(3)
        .strokeColor('#DC2626')
        .stroke();

      // Inner border
      doc
        .rect(40, 40, doc.page.width - 80, doc.page.height - 80)
        .lineWidth(1)
        .strokeColor('#991B1B')
        .stroke();

      // Header
      doc
        .fontSize(14)
        .fillColor('#991B1B')
        .text('A2R DEMO', 0, 70, { align: 'center' });

      doc
        .fontSize(32)
        .fillColor('#DC2626')
        .text('Certificate of Donation', 0, 100, { align: 'center' });

      // Decorative line
      doc
        .moveTo(200, 145)
        .lineTo(doc.page.width - 200, 145)
        .lineWidth(2)
        .strokeColor('#DC2626')
        .stroke();

      // Body text
      doc
        .fontSize(16)
        .fillColor('#1F2937')
        .text('This is to certify that', 0, 170, { align: 'center' });

      // Donor name
      doc
        .fontSize(28)
        .fillColor('#991B1B')
        .text(data.donorName, 0, 200, { align: 'center' });

      // Details
      doc
        .fontSize(14)
        .fillColor('#1F2937')
        .text(
          `has voluntarily donated ${data.units} unit(s) of blood (Group: ${data.bloodGroup})`,
          0,
          250,
          { align: 'center' }
        );

      doc
        .fontSize(14)
        .text(
          `on ${new Date(data.donationDate).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}`,
          0,
          280,
          { align: 'center' }
        );

      doc
        .fontSize(14)
        .text(`at ${data.location}`, 0, 310, { align: 'center' });

      // Appreciation
      doc
        .fontSize(16)
        .fillColor('#991B1B')
        .text(
          'Your generous contribution helps save lives. Thank you for being a hero!',
          100,
          360,
          { align: 'center', width: doc.page.width - 200 }
        );

      // Certificate ID
      doc
        .fontSize(10)
        .fillColor('#6B7280')
        .text(`Certificate ID: ${data.donationId}`, 60, doc.page.height - 120);

      // Date issued
      doc
        .fontSize(10)
        .text(
          `Date Issued: ${new Date().toLocaleDateString('en-IN')}`,
          60,
          doc.page.height - 105
        );

      // Signature line
      doc
        .moveTo(doc.page.width - 280, doc.page.height - 100)
        .lineTo(doc.page.width - 80, doc.page.height - 100)
        .lineWidth(1)
        .strokeColor('#1F2937')
        .stroke();

      doc
        .fontSize(12)
        .fillColor('#1F2937')
        .text('Authorized Signatory', doc.page.width - 280, doc.page.height - 95, {
          width: 200,
          align: 'center',
        });

      // Blood drop icon (simple circle)
      doc.circle(doc.page.width / 2, doc.page.height - 100, 15).fill('#DC2626');
      doc
        .fontSize(14)
        .fillColor('#FFFFFF')
        .text('♥', doc.page.width / 2 - 7, doc.page.height - 107);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateDonationCertificate };
