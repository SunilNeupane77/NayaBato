import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import jwt from 'jsonwebtoken';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';


export function generateToken(payload) {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
}

/**
 * Verify a JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object|null} - Decoded token data or null if invalid
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Middleware to protect admin routes
 * @param {Function} handler - API route handler
 * @returns {Function} - Protected handler
 */
export function withAdminProtection(handler) {
  return async (req, context) => {
    try {
      const session = await getServerSession(authOptions);
      
      if (!session) {
        return NextResponse.json(
          { success: false, message: 'Not authenticated' },
          { status: 401 }
        );
      }
      
      if (session.user.role !== 'admin' && session.user.role !== 'official') {
        return NextResponse.json(
          { success: false, message: 'Not authorized' },
          { status: 403 }
        );
      }
      
      return handler(req, context);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { success: false, message: 'Authentication error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Check if the current user is authenticated and authorized
 * @param {String[]} allowedRoles - Roles that are allowed to access 
 * @returns {Promise<Object>} - Authentication result
 */
export async function checkAuth(allowedRoles = ['admin', 'official', 'citizen']) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return { 
        isAuthenticated: false,
        isAuthorized: false,
        user: null,
        message: 'Not authenticated' 
      };
    }
    
    const isAuthorized = allowedRoles.includes(session.user.role);
    
    return {
      isAuthenticated: true,
      isAuthorized,
      user: session.user,
      message: isAuthorized ? 'Authorized' : 'Not authorized for this action'
    };
  } catch (error) {
    console.error('Auth check error:', error);
    return { 
      isAuthenticated: false,
      isAuthorized: false,
      user: null,
      message: 'Authentication error' 
    };
  }
}
i