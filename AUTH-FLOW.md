# Authentication Flow Diagram

## Complete Authentication Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER AUTHENTICATION FLOW                      │
└─────────────────────────────────────────────────────────────────┘

1. NEW USER REGISTRATION
   ┌──────────────┐
   │   Browser    │
   └──────┬───────┘
          │ Visit /auth/signup
          ▼
   ┌──────────────────┐
   │  SignUp Page     │
   │  - Enter details │
   │  - Select role   │
   └──────┬───────────┘
          │ Submit form
          ▼
   ┌──────────────────────────┐
   │ POST /api/auth/register  │
   │ - Validate data          │
   │ - Hash password (bcrypt) │
   │ - Save to MongoDB        │
   └──────┬───────────────────┘
          │ Success
          ▼
   ┌──────────────────┐
   │ Redirect to      │
   │ /auth/signin     │
   └──────────────────┘


2. USER LOGIN
   ┌──────────────┐
   │   Browser    │
   └──────┬───────┘
          │ Visit /auth/signin
          ▼
   ┌──────────────────┐
   │  SignIn Page     │
   │  - Enter email   │
   │  - Enter password│
   └──────┬───────────┘
          │ Submit credentials
          ▼
   ┌────────────────────────┐
   │ NextAuth Credentials   │
   │ Provider               │
   │ - Find user in DB      │
   │ - Compare password     │
   │ - Create JWT token     │
   └──────┬─────────────────┘
          │ Success
          ▼
   ┌──────────────────┐
   │ Session Created  │
   │ - JWT stored     │
   │ - Cookie set     │
   └──────┬───────────┘
          │
          ▼
   ┌──────────────────┐
   │ Redirect to /    │
   │ (Dashboard)      │
   └──────────────────┘


3. PROTECTED ROUTE ACCESS
   ┌──────────────┐
   │   Browser    │
   └──────┬───────┘
          │ Request / or /admin
          ▼
   ┌─────────────────────┐
   │   Middleware.ts     │
   │   - Check session   │
   │   - Verify JWT      │
   │   - Check role      │
   └──────┬──────────────┘
          │
          ├─── Authenticated & Authorized ───┐
          │                                   ▼
          │                           ┌──────────────┐
          │                           │ Allow access │
          │                           │ Show page    │
          │                           └──────────────┘
          │
          ├─── Not authenticated ────────────┐
          │                                   ▼
          │                           ┌──────────────────┐
          │                           │ Redirect to      │
          │                           │ /auth/signin     │
          │                           └──────────────────┘
          │
          └─── Wrong role ──────────────────┐
                                            ▼
                                     ┌──────────────────┐
                                     │ Redirect to      │
                                     │ /unauthorized    │
                                     └──────────────────┘


4. ADMIN OPERATIONS
   ┌──────────────┐
   │ Admin User   │
   └──────┬───────┘
          │ Visit /admin
          ▼
   ┌─────────────────────┐
   │   Middleware.ts     │
   │   - Session valid?  │
   │   - Role = admin?   │
   └──────┬──────────────┘
          │ ✓ Authorized
          ▼
   ┌──────────────────────┐
   │  Admin Dashboard     │
   │  - View all users    │
   │  - Manage roles      │
   └──────┬───────────────┘
          │ Change user role
          ▼
   ┌────────────────────────────┐
   │ PATCH /api/admin/users/id  │
   │ - Verify admin session     │
   │ - Update role in DB        │
   └──────┬───────────────────┘
          │ Success
          ▼
   ┌──────────────────┐
   │ Refresh data     │
   │ Show updated list│
   └──────────────────┘


5. LOGOUT FLOW
   ┌──────────────┐
   │     User     │
   └──────┬───────┘
          │ Click logout
          ▼
   ┌──────────────────┐
   │ signOut() called │
   │ - Clear session  │
   │ - Remove cookie  │
   └──────┬───────────┘
          │
          ▼
   ┌──────────────────┐
   │ Redirect to      │
   │ /auth/signin     │
   └──────────────────┘
```

## Role-Based Access Matrix

```
┌────────────────┬──────┬───────────┬───────┐
│     Feature    │ User │ Responder │ Admin │
├────────────────┼──────┼───────────┼───────┤
│ View Dashboard │  ✓   │     ✓     │   ✓   │
│ Report Emergency│  ✓   │     ✓     │   ✓   │
│ Update Location│  ✓   │     ✓     │   ✓   │
│ View All Cases │  ✗   │     ✓     │   ✓   │
│ Update Status  │  ✗   │     ✓     │   ✓   │
│ Admin Dashboard│  ✗   │     ✗     │   ✓   │
│ Manage Users   │  ✗   │     ✗     │   ✓   │
│ Assign Roles   │  ✗   │     ✗     │   ✓   │
│ Delete Users   │  ✗   │     ✗     │   ✓   │
└────────────────┴──────┴───────────┴───────┘
```

## API Authentication Flow

```
┌──────────────────────────────────────────────────────┐
│              API ROUTE AUTHENTICATION                 │
└──────────────────────────────────────────────────────┘

Client Request
     │
     ▼
┌─────────────────────┐
│  API Route Handler  │
└──────┬──────────────┘
       │
       ▼
┌──────────────────────────┐
│ getServerSession()       │
│ - Extract JWT from cookie│
│ - Verify signature       │
│ - Decode payload         │
└──────┬───────────────────┘
       │
       ├── Session exists ────┐
       │                      ▼
       │              ┌──────────────────┐
       │              │ Check user role  │
       │              └──────┬───────────┘
       │                     │
       │                     ├── Authorized ───► Process request
       │                     │
       │                     └── Forbidden ────► Return 403
       │
       └── No session ───────────────────────► Return 401
```

## Session Storage

```
┌─────────────────────────────────────────┐
│         JWT TOKEN STRUCTURE              │
├─────────────────────────────────────────┤
│ Header                                   │
│ {                                        │
│   "alg": "HS256",                       │
│   "typ": "JWT"                          │
│ }                                        │
├─────────────────────────────────────────┤
│ Payload                                  │
│ {                                        │
│   "id": "user_id",                      │
│   "email": "user@example.com",          │
│   "name": "User Name",                  │
│   "role": "admin",                      │
│   "phone": "+639123456789",             │
│   "iat": 1234567890,                    │
│   "exp": 1237159890                     │
│ }                                        │
├─────────────────────────────────────────┤
│ Signature                                │
│ HMACSHA256(                             │
│   base64UrlEncode(header) + "." +       │
│   base64UrlEncode(payload),             │
│   NEXTAUTH_SECRET                       │
│ )                                        │
└─────────────────────────────────────────┘
```

## Database Schema

```
┌───────────────────────────────────────────┐
│           USERS COLLECTION                │
├───────────────────────────────────────────┤
│ _id: ObjectId                             │
│ name: String                              │
│ email: String (unique, indexed)           │
│ password: String (bcrypt hashed)          │
│ phone: String (unique, indexed)           │
│ role: Enum ['user','admin','responder']  │
│ currentLocation: {                        │
│   latitude: Number                        │
│   longitude: Number                       │
│   accuracy: Number                        │
│   timestamp: Date                         │
│ }                                         │
│ isActive: Boolean                         │
│ lastSeen: Date                            │
│ emailVerified: Date                       │
│ createdAt: Date                           │
│ updatedAt: Date                           │
└───────────────────────────────────────────┘

Indexes:
- email (unique)
- phone (unique)
- role
- isActive
```

## Security Layers

```
┌─────────────────────────────────────────────────┐
│              SECURITY ARCHITECTURE               │
└─────────────────────────────────────────────────┘

Layer 1: Client-Side
├── Input validation
├── HTTPS only in production
├── XSS protection
└── CSRF tokens

Layer 2: Middleware
├── JWT verification
├── Session validation
├── Role checking
└── Route protection

Layer 3: API Routes
├── Server-side session check
├── Role authorization
├── Input sanitization
└── Rate limiting (future)

Layer 4: Database
├── Password hashing (bcrypt, 10 rounds)
├── Unique constraints
├── Connection encryption
└── IP whitelisting (MongoDB Atlas)

Layer 5: Environment
├── Secret key management
├── Environment variables
├── Secure cookie flags
└── Session expiry (30 days)
```

## Error Handling

```
Authentication Errors:
├── Invalid credentials     → "Invalid password" / "No user found"
├── Missing fields          → "Please enter email and password"
├── Expired session         → Redirect to /auth/signin
├── Invalid JWT             → Clear session, redirect
└── Database error          → Generic error message

Authorization Errors:
├── Wrong role              → Redirect to /unauthorized
├── No session              → Redirect to /auth/signin
├── Accessing auth page     → Redirect to / (dashboard)
└── Admin route as user     → Redirect to /unauthorized
```

This visual guide shows the complete authentication flow from registration through to accessing protected resources!
