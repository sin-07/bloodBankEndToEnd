import jwt from 'jsonwebtoken';
import User from '@/lib/models/User';
import connectDB from '@/lib/db';

/**
 * Verify JWT token from request headers and return the user.
 * Used in API route handlers instead of Express middleware.
 * @param {Request} request - NextRequest object
 * @returns {Promise<Object>} user object
 */
export async function getAuthUser(request) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthError('Not authorized, no token', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await connectDB();
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      throw new AuthError('User not found', 401);
    }

    if (!user.isActive) {
      throw new AuthError('Account is deactivated', 403);
    }

    return user;
  } catch (error) {
    if (error instanceof AuthError) throw error;
    throw new AuthError('Not authorized, token failed', 401);
  }
}

/**
 * Require specific role(s) - call after getAuthUser
 * @param {Object} user - User from getAuthUser
 * @param  {...string} roles - Allowed roles
 */
export function requireRole(user, ...roles) {
  if (!roles.includes(user.role)) {
    throw new AuthError(`Role ${user.role} is not authorized to access this resource`, 403);
  }
}

/**
 * Custom error class for auth errors
 */
export class AuthError extends Error {
  constructor(message, statusCode = 401) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Standard error response helper
 */
export function errorResponse(error) {
  const status = error.statusCode || 500;
  const message = error.message || 'Internal server error';
  return Response.json({ success: false, message }, { status });
}
