/**
 * Generate a donation certificate PDF using raw PDF content (no external deps).
 * Object layout:
 *   1 – Catalog
 *   2 – Pages
 *   3 – Page  (references /Contents 7 0 R, fonts F1=4, F2=5, F3=6)
 *   4 – Font  Helvetica          (F1)
 *   5 – Font  Helvetica-Bold     (F2)
 *   6 – Font  Helvetica-Oblique  (F3)
 *   7 – Content stream
 *
 * Previous version had a numbering bug: Helvetica-Bold was assigned num=5
 * AND the content stream was spliced in as num=5 → duplicate → blank page.
 * Fixed by building the stream first then adding all objects in correct order.
 */
export const generateDonationCertificate = async (data) => {
  const dateStr = new Date(data.donationDate).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const issuedDate = new Date().toLocaleDateString('en-IN');

  // A4 landscape
  const W = 842;
  const H = 595;
  const cx = W / 2;

  // ── PDF drawing helpers ──────────────────────────────────────────────────
  const escPdf = (s) =>
    String(s).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

  const lines = [];

  // Use absolute Tm (text matrix) so every call is independent of prior state
  const textCenter = (font, size, r, g, b, text, y) => {
    const approxW = text.length * size * 0.28;
    const x = cx - approxW;
    lines.push(
      `BT /${font} ${size} Tf ${r} ${g} ${b} rg 1 0 0 1 ${x.toFixed(1)} ${y.toFixed(1)} Tm (${escPdf(text)}) Tj ET`
    );
  };

  const textLeft = (font, size, r, g, b, text, x, y) => {
    lines.push(
      `BT /${font} ${size} Tf ${r} ${g} ${b} rg 1 0 0 1 ${x.toFixed(1)} ${y.toFixed(1)} Tm (${escPdf(text)}) Tj ET`
    );
  };

  // ── Drawing commands ─────────────────────────────────────────────────────
  lines.push('0.863 0.149 0.149 RG');
  lines.push('3 w');
  lines.push(`30 30 ${W - 60} ${H - 60} re S`);

  lines.push('0.600 0.106 0.106 RG');
  lines.push('1 w');
  lines.push(`40 40 ${W - 80} ${H - 80} re S`);

  textCenter('F2', 15, 0.6, 0.106, 0.106, 'SRISHTI BLOOD BANK', H - 80);
  textCenter('F2', 30, 0.863, 0.149, 0.149, 'Certificate of Donation', H - 120);

  lines.push('0.863 0.149 0.149 RG');
  lines.push('2 w');
  lines.push(`200 ${H - 145} m ${W - 200} ${H - 145} l S`);

  textCenter('F1', 16, 0.122, 0.161, 0.216, 'This is to certify that', H - 180);
  textCenter('F2', 26, 0.6, 0.106, 0.106, data.donorName || 'Donor', H - 215);
  textCenter('F1', 14, 0.122, 0.161, 0.216,
    `has voluntarily donated ${data.units} unit(s) of blood (Group: ${data.bloodGroup})`, H - 260);
  textCenter('F1', 14, 0.122, 0.161, 0.216, `on ${dateStr}`, H - 285);
  textCenter('F1', 14, 0.122, 0.161, 0.216, `at ${data.location || 'Blood Bank'}`, H - 310);
  textCenter('F3', 14, 0.6, 0.106, 0.106,
    'Your generous contribution helps save lives. Thank you for being a hero!', H - 360);

  textLeft('F1', 10, 0.42, 0.45, 0.5, `Certificate ID: ${data.donationId}`, 60, 80);
  textLeft('F1', 10, 0.42, 0.45, 0.5, `Date Issued: ${issuedDate}`, 60, 65);

  lines.push('0.122 0.161 0.216 RG');
  lines.push('1 w');
  lines.push(`${W - 280} 80 m ${W - 80} 80 l S`);
  textLeft('F1', 11, 0.122, 0.161, 0.216, 'Authorized Signatory', W - 245, 62);

  // Red filled circle (bottom-center decoration)
  lines.push('0.863 0.149 0.149 rg');
  const ccx = cx, ccy = 75, rad = 15, k = 0.5523;
  lines.push(`${ccx} ${ccy + rad} m`);
  lines.push(`${ccx + rad * k} ${ccy + rad} ${ccx + rad} ${ccy + rad * k} ${ccx + rad} ${ccy} c`);
  lines.push(`${ccx + rad} ${ccy - rad * k} ${ccx + rad * k} ${ccy - rad} ${ccx} ${ccy - rad} c`);
  lines.push(`${ccx - rad * k} ${ccy - rad} ${ccx - rad} ${ccy - rad * k} ${ccx - rad} ${ccy} c`);
  lines.push(`${ccx - rad} ${ccy + rad * k} ${ccx - rad * k} ${ccy + rad} ${ccx} ${ccy + rad} c`);
  lines.push('f');

  // ── Build content stream ─────────────────────────────────────────────────
  const stream = lines.join('\n');
  const streamLen = Buffer.byteLength(stream, 'binary');

  // ── Add PDF objects in correct order (NO splicing) ───────────────────────
  //   1=Catalog  2=Pages  3=Page  4=F1  5=F2  6=F3  7=ContentStream
  const objects = [];
  const addObj = (content) => { objects.push({ num: objects.length + 1, content }); };

  addObj('<< /Type /Catalog /Pages 2 0 R >>');
  addObj('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  addObj(
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}]` +
    ` /Contents 7 0 R` +
    ` /Resources << /Font << /F1 4 0 R /F2 5 0 R /F3 6 0 R >> >> >>`
  );
  addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
  addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique >>');
  addObj(`<< /Length ${streamLen} >>\nstream\n${stream}\nendstream`);

  // ── Serialise ────────────────────────────────────────────────────────────
  const header = '%PDF-1.4\n';
  let body = '';
  const offsets = [];
  for (const obj of objects) {
    offsets[obj.num] = header.length + body.length;
    body += `${obj.num} 0 obj\n${obj.content}\nendobj\n`;
  }

  const numObjs = objects.length;
  const xrefOffset = header.length + body.length;
  let xref = `xref\n0 ${numObjs + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= numObjs; i++) {
    xref += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  const trailer =
    `trailer\n<< /Size ${numObjs + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(header + body + xref + trailer, 'binary');
};
