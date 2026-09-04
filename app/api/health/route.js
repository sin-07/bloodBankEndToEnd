import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  let dbStatus = 'disconnected';
  let dbLatencyMs = 0;

  try {
    await connectDB();
    const readyState = mongoose.connection.readyState;

    if (readyState === 1) {
      const pingStart = Date.now();
      if (mongoose.connection.db) {
        await mongoose.connection.db.admin().ping();
      }
      dbLatencyMs = Date.now() - pingStart;
      dbStatus = 'connected';
    } else {
      dbStatus = readyState === 2 ? 'connecting' : 'disconnected';
    }

    return NextResponse.json(
      {
        status: 'healthy',
        service: 'Srishti Blood Bank API',
        timestamp: new Date().toISOString(),
        database: {
          status: dbStatus,
          latencyMs: dbLatencyMs,
          name: mongoose.connection.name || 'BloodBank',
        },
        uptime: process.uptime(),
        responseTimeMs: Date.now() - startTime,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        service: 'Srishti Blood Bank API',
        timestamp: new Date().toISOString(),
        database: {
          status: 'error',
          message: error.message || 'Database connection error',
        },
        responseTimeMs: Date.now() - startTime,
      },
      { status: 503 }
    );
  }
}
