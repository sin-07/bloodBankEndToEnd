/**
 * Seed / upsert a single admin user.
 * Usage:  node scripts/seed-admin.js
 *
 * Reads MONGODB_URI from .env.local, pre-resolves the SRV record via
 * Google DNS (works around the c-ares issue on this machine), then
 * upserts  a2r@gmail.com / 1234567  as role=admin.
 */

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const dns      = require('dns');
const fs       = require('fs');
const path     = require('path');

/* ---------- load .env.local ---------- */
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8')
    .replace(/\r\n/g, '\n')          // normalise Windows line endings
    .split('\n')
    .forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx < 0) return;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
      if (key) process.env[key] = val;
    });
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error('MONGODB_URI not found in .env.local'); process.exit(1); }

/* ---------- SRV pre-resolution (same logic as lib/db.js) ---------- */
async function resolveURI(uri) {
  if (!uri.startsWith('mongodb+srv://')) return uri;

  const { Resolver } = dns.promises;
  const resolver = new Resolver();
  resolver.setServers(['8.8.8.8', '8.8.4.4']);

  const withoutScheme = uri.slice('mongodb+srv://'.length);
  const atIdx         = withoutScheme.indexOf('@');
  const credentials   = withoutScheme.slice(0, atIdx);
  const rest          = withoutScheme.slice(atIdx + 1);
  const slashIdx      = rest.indexOf('/');
  const srvHost       = slashIdx >= 0 ? rest.slice(0, slashIdx) : rest;
  const dbAndParams   = slashIdx >= 0 ? rest.slice(slashIdx) : '/';

  const srvRecords = await resolver.resolveSrv(`_mongodb._tcp.${srvHost}`);
  const hosts      = srvRecords.map(r => `${r.name}:${r.port}`).join(',');

  let txtParams = 'authSource=admin&retryWrites=true&w=majority';
  try {
    const txt = await resolver.resolveTxt(srvHost);
    if (txt.length) txtParams = txt[0].join('');
  } catch (_) {}

  if (!txtParams.includes('ssl=') && !txtParams.includes('tls=')) txtParams += '&ssl=true';

  const direct = `mongodb://${credentials}@${hosts}${dbAndParams}${dbAndParams.includes('?') ? '&' : '?'}${txtParams}`;
  console.log('[seed] SRV resolved →', hosts);
  return direct;
}

/* ---------- minimal User schema (mirrors lib/models/User.js) ---------- */
const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['admin','donor','hospital'], default: 'donor' },
  phone:    String,
  city:     String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

/* ---------- main ---------- */
(async () => {
  try {
    const uri = await resolveURI(MONGODB_URI);

    await mongoose.connect(uri, { tls: true, serverSelectionTimeoutMS: 10000 });
    console.log('[seed] MongoDB connected');

    // Use the existing collection; getModel gracefully handles already-registered models
    const User = mongoose.models.User || mongoose.model('User', userSchema);

    const hashed = await bcrypt.hash('admin123', 12);

    const result = await User.findOneAndUpdate(
      { email: 'admin@bloodbank.com' },
      {
        $set: {
          name:     'System Administrator',
          password: hashed,
          role:     'admin',
          phone:    '+91 98200 12345',
          city:     'Mumbai',
          isActive: true,
        },
        $setOnInsert: { email: 'admin@bloodbank.com' },
      },
      { upsert: true, new: true }
    );

    console.log(`[seed] ✅  Admin upserted — email: admin@bloodbank.com | role: ${result.role} | id: ${result._id}`);
  } catch (err) {
    console.error('[seed] ❌  Error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();
