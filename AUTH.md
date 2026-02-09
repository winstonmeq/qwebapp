# Authentication & Authorization Guide

## Overview

The Emergency Management System now includes a complete authentication and authorization system using NextAuth.js with role-based access control (RBAC).

## Features

- ✅ **Email/Password Authentication** - Secure credential-based login
- ✅ **Role-Based Access Control** - Three roles: Admin, Responder, User
- ✅ **Protected Routes** - Middleware protection for sensitive pages
- ✅ **Session Management** - JWT-based sessions with 30-day expiry
- ✅ **Password Hashing** - bcrypt encryption for secure storage
- ✅ **Admin Dashboard** - User management interface for admins

## User Roles

### 1. **User** (Default)
- Access emergency reporting form
- View their own emergencies
- Update their location
- Basic dashboard access

### 2. **Responder**
- All User permissions
- View all active emergencies
- Update emergency status
- Access to responder tools

### 3. **Admin**
- All Responder permissions
- Access to admin dashboard
- User management (CRUD operations)
- Role assignment
- System configuration

## Setup Instructions

### 1. Environment Variables

Add to your `.env.local`:

```env
MONGODB_URI=your-mongodb-connection-string
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
```

Generate a secure secret:
```bash
openssl rand -base64 32
```

### 2. Install Dependencies

```bash
npm install
```

Required packages:
- `next-auth` - Authentication framework
- `bcryptjs` - Password hashing
- `@types/bcryptjs` - TypeScript types

### 3. Seed Demo Users

Run the seed script to create initial users:

```bash
npm run seed
```

This creates three demo accounts:

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | admin123 | admin |
| user@example.com | user123 | user |
| responder@example.com | responder123 | responder |

### 4. Start the Application

```bash
npm run dev
```

## Usage

### Sign Up

1. Navigate to `/auth/signup`
2. Fill in registration form
3. Select role (defaults to "user")
4. Submit and get redirected to sign-in

### Sign In

1. Navigate to `/auth/signin`
2. Enter email and password
3. Click "Sign In"
4. Redirected to dashboard

### Sign Out

1. Click on your name in the header
2. Click "Sign Out"
3. Session cleared, redirected to sign-in

## Protected Routes

The following routes are protected by middleware:

- `/` - Dashboard (requires authentication)
- `/report` - Emergency reporting (requires authentication)
- `/admin/*` - Admin pages (requires admin role)
- `/auth/*` - Auth pages (redirects if already logged in)

## API Endpoints

### Authentication

**POST** `/api/auth/register`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+639123456789",
  "role": "user"
}
```

**POST** `/api/auth/signin` (NextAuth)
- Handled automatically by NextAuth

**POST** `/api/auth/signout` (NextAuth)
- Handled automatically by NextAuth

### Admin Routes (Admin Only)

**GET** `/api/admin/users`
- Returns all users (without passwords)

**PATCH** `/api/admin/users/[id]`
```json
{
  "role": "admin"
}
```

**DELETE** `/api/admin/users/[id]`
- Deletes user (cannot delete yourself)

## Code Examples

### Accessing Session in Component

```typescript
'use client';

import { useSession } from 'next-auth/react';

export default function MyComponent() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') {
    return <div>Loading...</div>;
  }
  
  if (status === 'unauthenticated') {
    return <div>Please sign in</div>;
  }
  
  return (
    <div>
      <p>Welcome, {session?.user?.name}</p>
      <p>Role: {session?.user?.role}</p>
    </div>
  );
}
```

### Accessing Session in API Route

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Check role
  if (session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // Your logic here
}
```

### Programmatic Sign Out

```typescript
import { signOut } from 'next-auth/react';

const handleLogout = () => {
  signOut({ callbackUrl: '/auth/signin' });
};
```

## Security Best Practices

### Implemented

✅ Password hashing with bcrypt (10 rounds)
✅ JWT sessions with 30-day expiry
✅ HTTPS-only cookies in production
✅ CSRF protection via NextAuth
✅ Role-based access control
✅ Protected API routes
✅ Middleware route protection

### Recommended for Production

- [ ] Enable email verification
- [ ] Add password reset functionality
- [ ] Implement rate limiting
- [ ] Add two-factor authentication (2FA)
- [ ] Set up password complexity requirements
- [ ] Add account lockout after failed attempts
- [ ] Implement audit logging
- [ ] Use environment-specific secrets
- [ ] Enable HTTPS in production
- [ ] Add CORS policies

## Middleware Configuration

The middleware protects routes based on authentication status and role:

```typescript
// middleware.ts
export const config = {
  matcher: [
    '/',
    '/admin/:path*',
    '/report',
    '/auth/:path*',
  ],
};
```

## Database Schema Updates

The User model now includes:

```typescript
{
  name: string;
  email: string;          // Required, unique
  password: string;       // Hashed with bcrypt
  phone: string;          // Required, unique
  role: 'user' | 'admin' | 'responder';
  currentLocation?: Location;
  isActive: boolean;
  lastSeen: Date;
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## Admin Dashboard Features

Located at `/admin`:

- **User Statistics**: Total users, admins, responders
- **User Table**: View all users with details
- **Role Management**: Change user roles with dropdown
- **User Deletion**: Remove users (with confirmation)
- **Refresh**: Manual data refresh button
- **Navigation**: Back to main dashboard

## Troubleshooting

### "Invalid credentials" error
- Check email/password are correct
- Ensure user exists in database
- Verify MONGODB_URI is set correctly

### "Unauthorized" error
- Sign out and sign in again
- Check role permissions
- Verify middleware configuration

### Session not persisting
- Check NEXTAUTH_SECRET is set
- Verify NEXTAUTH_URL matches your URL
- Clear browser cookies and try again

### Cannot access admin dashboard
- Ensure your account has "admin" role
- Run seed script or manually update role in database
- Sign out and sign in after role change

## Future Enhancements

Potential additions:
- OAuth providers (Google, GitHub, etc.)
- Magic link authentication
- Password reset via email
- Email verification
- Two-factor authentication
- Session activity tracking
- Password history
- Account recovery options

## Testing

### Manual Testing

1. **Registration Flow**
   - Sign up with new credentials
   - Verify account created
   - Sign in with new account

2. **Authentication Flow**
   - Sign in with valid credentials
   - Verify redirect to dashboard
   - Check session persists on refresh

3. **Authorization Flow**
   - Try accessing `/admin` as user (should fail)
   - Try accessing `/admin` as admin (should succeed)
   - Verify role-based UI changes

4. **Admin Functions**
   - Create/update/delete users
   - Change user roles
   - Verify changes persist

### Automated Testing (Future)

Consider adding:
- Unit tests for auth functions
- Integration tests for API routes
- E2E tests for auth flows

---

For additional support, refer to:
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- Main README.md for system overview
