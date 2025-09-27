import connectDB from '@/lib/db/connect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { SessionTracker } from '@/lib/session-tracker';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          await connectDB();

          const user = await User.findOne({ email: credentials.email }).select('+password');
          
          if (!user) {
            return null;
          }

          const isPasswordMatch = await bcrypt.compare(credentials.password, user.password);
          
          if (!isPasswordMatch) {
            return null;
          }
          
          // Check if the user account needs verification (officials and admins)
          if ((user.role === 'official' || user.role === 'admin') && !user.verified) {
            throw new Error('Account pending approval. Please contact an administrator.');
          }

          // Create session tracking (non-blocking)
          let sessionId = null;
          try {
            sessionId = await SessionTracker.createSession(user._id, req);
          } catch (error) {
            console.error('Session tracking error:', error);
            // Continue with authentication even if session tracking fails
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            verified: user.verified,
            department: user.department || null,
            sessionId
          };
        } catch (error) {
          console.error('Credentials auth error:', error);
          throw error;
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          await connectDB();
          console.log('Google OAuth attempt for:', user.email);
          
          let existingUser = await User.findOne({ email: user.email });
          console.log('Existing user found:', !!existingUser);
          
          if (!existingUser) {
            console.log('Creating new Google user');
            existingUser = await User.create({
              name: user.name,
              email: user.email,
              role: 'citizen',
              verified: true,
              googleId: profile.sub,
              avatar: user.image,
              notifications: {
                email: true,
                digest: false
              },
              preferences: {
                weeklyDigest: false
              }
            });
            console.log('New Google user created');
          } else if (!existingUser.googleId) {
            console.log('Linking Google to existing user');
            existingUser.googleId = profile.sub;
            if (!existingUser.avatar && user.image) {
              existingUser.avatar = user.image;
            }
            if (Array.isArray(existingUser.notifications)) {
              existingUser.notifications = {
                email: true,
                digest: false
              };
            }
            await existingUser.save();
            console.log('Google account linked');
          }
          
          return true;
        } catch (error) {
          console.error('Google sign-in error:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === 'google') {
          await connectDB();
          const dbUser = await User.findOne({ email: user.email });
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.role = dbUser.role;
            token.department = dbUser.department;
            token.verified = dbUser.verified;
            token.createdAt = dbUser.createdAt;
            
            // Create session for Google login
            try {
              const sessionId = await SessionTracker.createSession(dbUser._id);
              token.sessionId = sessionId;
            } catch (error) {
              console.error('Session tracking error:', error);
            }
          }
        } else {
          token.id = user.id;
          token.role = user.role;
          token.department = user.department;
          token.verified = user.verified;
          token.sessionId = user.sessionId;
          // For credentials login, fetch createdAt from database
          if (user.id) {
            try {
              await connectDB();
              const dbUser = await User.findById(user.id).select('createdAt');
              if (dbUser) {
                token.createdAt = dbUser.createdAt;
              }
            } catch (error) {
              console.error('Error fetching user createdAt:', error);
            }
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.department = token.department;
        session.user.verified = token.verified;
        session.user.sessionId = token.sessionId;
        session.user.createdAt = token.createdAt;
        
        // Fetch user data from database
        if (token.id) {
          try {
            await connectDB();
            const dbUser = await User.findById(token.id).select('avatar createdAt');
            if (dbUser) {
              // Use database avatar if available, otherwise keep the original session image (for Google users)
              if (dbUser.avatar) {
                session.user.image = dbUser.avatar;
              }
              session.user.createdAt = dbUser.createdAt;
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
        }
      }
      return session;
    }
  },
  events: {
    async signOut({ token }) {
      if (token?.sessionId) {
        try {
          await SessionTracker.endSession(token.sessionId);
        } catch (error) {
          console.error('Error ending session:', error);
        }
      }
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  logger: {
    error(code, metadata) {
      console.error('NextAuth Error:', code, metadata);
    },
    warn(code) {
      console.warn('NextAuth Warning:', code);
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === 'development') {
        console.log('NextAuth Debug:', code, metadata);
      }
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
