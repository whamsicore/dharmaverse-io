import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { addEmail } from './emailStorage';
import { Session } from 'next-auth';

// Extend Session type to include id
declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
}

// Define environment variable access for Vite
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '';

// Configure authentication options
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    }),
  ],
  // Session configuration
  session: {
    strategy: 'jwt',
  },
  // Custom pages (optional)
  pages: {
    signIn: '/signin',
  },
  // Callbacks
  callbacks: {
    async session({ session, token }) {
      // Send properties to the client
      if (token && session.user) {
        // Extend the user type to include id
        session.user = {
          ...session.user,
          id: token.sub
        };
      }
      return session;
    },
    async jwt({ token, user }) {
      // First time jwt is created (user signs in)
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    // Store email in our system when user signs in
    async signIn({ user }) {
      if (user.email) {
        try {
          // Use the email storage utility to save the email
          addEmail(user.email);
        } catch (error) {
          console.error('Failed to save user email:', error);
        }
      }
      return true;
    }
  },
};

// Define auth helper functions
export const getSession = async () => {
  const res = await fetch('/api/auth/session');
  const session = await res.json();
  return Object.keys(session).length > 0 ? session : null;
};

export const getUser = async () => {
  const session = await getSession();
  return session?.user || null;
};

export const signOut = async () => {
  const res = await fetch('/api/auth/signout', { method: 'POST' });
  return res.ok;
}; 