import mongoose from 'mongoose';
import { Resolver } from 'dns/promises';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable in .env.local');
}

/**
 * Cache for the resolved direct URI to prevent repeated DNS lookups.
 */
let cachedResolvedURI = null;

/**
 * Fallback DNS servers to try in sequence if local DNS or ISP blocks SRV queries.
 */
const DNS_SERVERS_LIST = [
  ['8.8.8.8', '8.8.4.4'],          // Google DNS
  ['1.1.1.1', '1.0.0.1'],          // Cloudflare DNS
  ['208.67.222.222', '208.67.220.220'], // OpenDNS
];

/**
 * Resolve mongodb+srv:// URI to a direct mongodb:// URI with individual shard hosts.
 * Bypasses Node.js c-ares DNS resolver limitations on Windows and ISP firewalls.
 */
async function resolveMongoURI(uri) {
  if (!uri.startsWith('mongodb+srv://')) return uri;
  if (cachedResolvedURI) return cachedResolvedURI;

  // Parse: mongodb+srv://user:pass@host/db?params
  const withoutScheme = uri.slice('mongodb+srv://'.length);
  const atIdx = withoutScheme.indexOf('@');
  if (atIdx === -1) return uri;

  const credentials = withoutScheme.slice(0, atIdx);
  const rest = withoutScheme.slice(atIdx + 1);
  const slashIdx = rest.indexOf('/');
  const srvHost = slashIdx >= 0 ? rest.slice(0, slashIdx) : rest;
  const dbAndParams = slashIdx >= 0 ? rest.slice(slashIdx) : '/BloodBank';

  let srvRecords = null;
  let txtParams = 'authSource=admin&retryWrites=true&w=majority';

  for (const servers of DNS_SERVERS_LIST) {
    try {
      const resolver = new Resolver();
      resolver.setServers(servers);

      srvRecords = await resolver.resolveSrv(`_mongodb._tcp.${srvHost}`);

      try {
        const txtRecords = await resolver.resolveTxt(srvHost);
        if (txtRecords.length > 0) {
          txtParams = txtRecords[0].join('');
        }
      } catch {
        // TXT record optional, fallback to defaults
      }

      if (srvRecords && srvRecords.length > 0) {
        break; // Successfully resolved
      }
    } catch {
      // Continue to next resolver
    }
  }

  if (!srvRecords || srvRecords.length === 0) {
    console.warn('[DB] Fallback DNS resolution failed, attempting direct connection with original URI');
    return uri;
  }

  const hosts = srvRecords.map((r) => `${r.name}:${r.port}`).join(',');

  // Enforce TLS and retry writes
  if (!txtParams.includes('ssl=true') && !txtParams.includes('tls=true')) {
    txtParams += '&ssl=true';
  }
  if (!txtParams.includes('authSource=')) {
    txtParams += '&authSource=admin';
  }

  const directURI = `mongodb://${credentials}@${hosts}${dbAndParams}${dbAndParams.includes('?') ? '&' : '?'}${txtParams}`;
  cachedResolvedURI = directURI;
  console.log(`[DB] Successfully resolved MongoDB SRV via external DNS (${srvRecords.length} shards)`);
  return directURI;
}

/**
 * Global cache across hot reloads in development.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const resolvedURI = await resolveMongoURI(MONGODB_URI);

    const opts = {
      bufferCommands: false,
      tls: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
    };

    cached.promise = mongoose.connect(resolvedURI, opts).then((mongooseInstance) => {
      console.log('[DB] MongoDB Connected Successfully to Atlas');
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
    console.error('[DB] MongoDB Connection Error:', e.message);
    throw e;
  }

  return cached.conn;
}

export default connectDB;
