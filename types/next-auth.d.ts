import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * The User object returned from authorize() 
   * and stored in the database.
   */
  interface User {
    id: string;
    name: string;
    role: "user" | "responder" | "system-admin"; // Match your seed roles
    phone: string;
    lguCode: string;
    image?: string;
    googleId?: string;
  }

  /**
   * The Session object available via useSession() or getServerSession()
   */
  interface Session {
    user: {
      id: string;
      name: string;
      role: string;
      image?: string;
      googleId?: string;
      lguCode: string;
      phone: string;
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    lguCode: string;
    image?: string;
    googleId?: string;
    name: string;
  }
}