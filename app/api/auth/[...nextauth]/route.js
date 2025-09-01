import connectDB from '@/lib/db/connect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { SessionTracker } from '@/lib/session-tracker';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
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
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.department = user.department;
        token.verified = user.verified;
        token.sessionId = user.sessionId;
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
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
