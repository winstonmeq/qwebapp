import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google'; // 1. Added Google
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import UserModel from '@/models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    // --- GOOGLE PROVIDER ---
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),

    // --- CREDENTIALS PROVIDER ---
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter email and password');
        }

        await connectDB();

        const user = await UserModel.findOne({ email: credentials.email });

        // FIX: Check if user exists AND if they actually have a password
        if (!user) {
          throw new Error('No user found with this email');
        }

        if (!user.password) {
          throw new Error('This account was created using Google. Please sign in with Google.');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Invalid password');
        }

        // Update last seen
        user.lastSeen = new Date();
        await user.save();

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          image: user.image,
          googleId: user.googleId,
          lguCode: user.lguCode || null,
        } as any;
      },
    }),
  ],
  callbacks: {
    // This runs when a user signs in via OAuth (Google)
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        await connectDB();
        
        // Find or create the user in your database
        const existingUser = await UserModel.findOne({ email: user.email });
        
        if (!existingUser) {
          // Optional: Create a new user record if they don't exist
          await UserModel.create({
            name: user.name,
            email: user.email,
            image: user.image,
            googleId: account.providerAccountId,
            role: 'user', // Default role
            isActive: true,
          });
        } else if (!existingUser.googleId) {
          // Link Google ID to existing email account if not already linked
          existingUser.googleId = account.providerAccountId;
          await existingUser.save();
        }
      }
      return true;
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        // Fetch fresh data from DB for OAuth users to get roles/lguCode
        await connectDB();
        const dbUser = await UserModel.findOne({ email: token.email });
        
        if (dbUser) {
          token.role = dbUser.role;
          token.id = dbUser._id.toString();
          token.phone = dbUser.phone;
          token.googleId = dbUser.googleId;
          token.lguCode = dbUser.lguCode;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
        session.user.phone = token.phone as string;
        session.user.googleId = token.googleId as string;
        session.user.lguCode = token.lguCode as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};