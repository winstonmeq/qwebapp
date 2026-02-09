# Changelog

## Version 2.0.0 - Authentication & Authorization (Latest)

### 🎉 Major Features Added

- **NextAuth.js Integration**: Complete authentication system with email/password login
- **Role-Based Access Control**: Three user roles (Admin, Responder, User)
- **Admin Dashboard**: User management interface at `/admin`
- **Protected Routes**: Middleware-based route protection
- **Session Management**: JWT sessions with 30-day expiry
- **Password Security**: bcrypt hashing with salt rounds

### 📁 New Files

**Authentication Core:**
- `lib/auth.ts` - NextAuth configuration
- `app/api/auth/[...nextauth]/route.ts` - NextAuth API handler
- `app/api/auth/register/route.ts` - User registration endpoint
- `types/next-auth.d.ts` - NextAuth TypeScript declarations
- `components/AuthProvider.tsx` - Session provider wrapper
- `middleware.ts` - Route protection middleware

**Pages:**
- `app/auth/signin/page.tsx` - Sign-in page
- `app/auth/signup/page.tsx` - Registration page
- `app/admin/page.tsx` - Admin dashboard
- `app/unauthorized/page.tsx` - Unauthorized access page

**API Routes:**
- `app/api/admin/users/route.ts` - Get all users (admin only)
- `app/api/admin/users/[id]/route.ts` - Update/delete user (admin only)

**Scripts:**
- `scripts/seed-users.js` - Seed demo users

**Documentation:**
- `AUTH.md` - Complete authentication guide

### 🔄 Modified Files

**Models:**
- `models/User.ts` - Added email, password, role, emailVerified fields
- `types/index.ts` - Updated User interface with auth fields

**Configuration:**
- `package.json` - Added next-auth, bcryptjs dependencies and seed script
- `.env.local.example` - Added NEXTAUTH_URL and NEXTAUTH_SECRET
- `app/layout.tsx` - Wrapped with AuthProvider

**Components:**
- `app/page.tsx` - Added user menu, session handling, logout functionality

### 🎯 User Roles & Permissions

**User (Default):**
- View and report emergencies
- Update own location
- Access basic dashboard

**Responder:**
- All User permissions
- View all emergencies
- Update emergency status

**Admin:**
- All Responder permissions
- Access admin dashboard
- Manage users (CRUD)
- Assign roles

### 🔐 Security Improvements

- Password hashing with bcrypt (10 rounds)
- JWT-based session tokens
- Protected API routes with role checks
- Middleware authentication
- CSRF protection via NextAuth
- Secure cookie handling

### 📊 Demo Credentials

```
Admin:     admin@example.com / admin123
User:      user@example.com / user123
Responder: responder@example.com / responder123
```

### 🚀 Migration Steps

For existing installations:

1. Update dependencies: `npm install`
2. Add environment variables to `.env.local`:
   ```
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here
   ```
3. Run seed script: `npm run seed`
4. Restart development server

### 📝 Breaking Changes

- All routes now require authentication
- User model schema updated (requires re-seeding or migration)
- Emergency creation now uses authenticated user data

---

## Version 1.0.0 - Initial Release

### Features

- Real-time GPS tracking
- Emergency reporting system
- Interactive Leaflet maps
- MongoDB Atlas integration
- Auto-refresh dashboard
- Multiple emergency types and severity levels
- User location tracking
- Emergency status management

### Tech Stack

- Next.js 14 with App Router
- MongoDB + Mongoose
- Tailwind CSS
- React Leaflet
- TypeScript

### Initial Files

- Dashboard with map and list views
- Emergency reporting form
- API routes for emergencies and locations
- MongoDB models and schemas
- GPS simulator for testing
