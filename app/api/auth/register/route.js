import connectDB from '@/lib/db/connect';
import { sendWelcomeEmail } from '@/lib/email';
import User from '@/models/User';
import { NextResponse } from 'next/server';

/**
 * User registration endpoint
 * @route POST /api/auth/register
 */
export async function POST(request) {
  try {
    const { name, email, password, phoneNumber, role } = await request.json();
    
    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate role if provided
    const validRoles = ['citizen', 'official', 'admin'];
    const userRole = role && validRoles.includes(role) ? role : 'citizen';

    // Connect to database
    await connectDB();
    
    // Check if user already exists
    const userExists = await User.findOne({ email });
    
    if (userExists) {
      return NextResponse.json(
        { success: false, message: 'Email already registered' },
        { status: 400 }
      );
    }
    
    // Create new user (password will be hashed by the pre-save hook)
    const user = await User.create({
      name,
      email,
      password,
      phoneNumber: phoneNumber || '',
      role: userRole,
      // For non-citizen roles, set verified to false until approved
      verified: userRole === 'citizen'
    });
    
    // Send welcome email to the newly registered user
    try {
      await sendWelcomeEmail({
        to: user.email,
        name: user.name,
        role: user.role
      });
      // Log successful email send
      console.log(`Welcome email sent to ${user.email}`);
    } catch (emailError) {
      // Log email error but continue with registration success
      console.error('Failed to send welcome email:', emailError);
    }

    // Return user without password
    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    
    return NextResponse.json(
      { success: false, message: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
