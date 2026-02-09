# TypeScript Troubleshooting Guide

## Common TypeScript Errors and Solutions

### 1. NextAuth Type Errors

#### Error: Missing 'credentials' property in CredentialsProvider

**Error Message:**
```
Property 'credentials' is missing in type '{ authorize(...) }' but required in type 'CredentialsConfig'
```

**Solution:**
The `credentials` property must be defined in the CredentialsProvider configuration:

```typescript
CredentialsProvider({
  name: 'Credentials',
  credentials: {
    email: { label: 'Email', type: 'email', placeholder: 'your@email.com' },
    password: { label: 'Password', type: 'password' },
  },
  async authorize(credentials, req) {
    // Your authorization logic
  },
})
```

#### Error: User type issues in authorize function

**Solution:**
Make sure your return type matches the expected User interface:

```typescript
return {
  id: user._id.toString(),
  email: user.email,
  name: user.name,
  role: user.role,
  phone: user.phone,
};
```

### 2. Session Type Errors

#### Error: Property 'role' does not exist on type 'User'

**Solution:**
Make sure you have the type declarations in `types/next-auth.d.ts`:

```typescript
import NextAuth, { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      phone: string;
    } & DefaultSession['user'];
  }

  interface User {
    role: string;
    phone: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
    id: string;
    phone: string;
  }
}
```

### 3. Mongoose Type Errors

#### Error: Type 'Document' is not assignable to type 'User'

**Solution:**
Use proper type assertions when working with Mongoose:

```typescript
import { Model } from 'mongoose';
import { User } from '@/types';

const UserModel: Model<User> = 
  mongoose.models.User || mongoose.model<User>('User', UserSchema);
```

### 4. API Route Type Errors

#### Error: Parameter 'params' implicitly has an 'any' type

**Solution:**
Properly type the params in dynamic routes:

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = params.id;
  // ...
}
```

### 5. Form Data Type Errors

#### Error: Element implicitly has an 'any' type

**Solution:**
Type your form state properly:

```typescript
interface FormData {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: 'user' | 'admin' | 'responder';
}

const [formData, setFormData] = useState<FormData>({
  email: '',
  password: '',
  name: '',
  phone: '',
  role: 'user',
});
```

### 6. Session Hook Type Errors

#### Error: Object is possibly 'null' or 'undefined'

**Solution:**
Use optional chaining and type guards:

```typescript
const { data: session } = useSession();

// Safe access
const userName = session?.user?.name;
const userRole = session?.user?.role;

// With type guard
if (session && session.user) {
  const role = session.user.role; // TypeScript knows this is safe
}
```

### 7. Middleware Type Errors

#### Error: Property 'nextauth' does not exist on type 'NextRequest'

**Solution:**
Use the correct type from next-auth/middleware:

```typescript
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token; // This is properly typed now
    // ...
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);
```

### 8. MongoDB Connection Type Errors

#### Error: Type '{}' is not assignable to type 'MongooseCache'

**Solution:**
Properly declare the global type:

```typescript
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };
```

## Quick Fixes

### If you're getting many type errors:

1. **Ensure all packages are installed:**
```bash
npm install next-auth@latest bcryptjs
npm install -D @types/bcryptjs
```

2. **Check tsconfig.json includes:**
```json
{
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ]
}
```

3. **Restart TypeScript server in VS Code:**
- Press `Cmd/Ctrl + Shift + P`
- Type "TypeScript: Restart TS Server"
- Press Enter

4. **Clear Next.js cache:**
```bash
rm -rf .next
npm run dev
```

5. **Verify type declaration files exist:**
- `types/next-auth.d.ts` should exist
- `types/index.ts` should have User interface

## Common Import Errors

### Error: Cannot find module 'next-auth'

**Solution:**
```bash
npm install next-auth@latest
```

### Error: Cannot find module 'bcryptjs'

**Solution:**
```bash
npm install bcryptjs
npm install -D @types/bcryptjs
```

### Error: Cannot find module '@/lib/auth'

**Solution:**
Check your `tsconfig.json` has the path alias:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

## Type-Safe Best Practices

### 1. Always type your state
```typescript
// Bad
const [user, setUser] = useState(null);

// Good
const [user, setUser] = useState<User | null>(null);
```

### 2. Type your API responses
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const response: ApiResponse<User> = await fetch('/api/users').then(r => r.json());
```

### 3. Use type guards
```typescript
function isAuthenticated(session: any): session is Session {
  return session !== null && session.user !== undefined;
}

if (isAuthenticated(session)) {
  console.log(session.user.email); // TypeScript knows this is safe
}
```

### 4. Avoid 'any' type
```typescript
// Bad
const handleChange = (e: any) => { ... }

// Good
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { ... }
```

## Still Having Issues?

1. Check your Node.js version: `node -v` (should be 18+)
2. Check TypeScript version: `npx tsc -v` (should be 5+)
3. Delete `node_modules` and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
4. Check for conflicting type definitions
5. Look at the complete error stack trace

## Useful Commands

```bash
# Type check without running
npx tsc --noEmit

# Show detailed type information
npx tsc --noEmit --listFiles

# Clear Next.js and restart
rm -rf .next && npm run dev
```

If you encounter an error not listed here, share the complete error message and we can troubleshoot it!
