# Authentication Code Examples

## Common Authentication Tasks

### 1. Accessing User Session in Components

```typescript
'use client';

import { useSession } from 'next-auth/react';

export default function MyComponent() {
  const { data: session, status } = useSession();

  // Loading state
  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  // Not authenticated
  if (status === 'unauthenticated') {
    return <div>Please sign in to continue</div>;
  }

  // Authenticated
  return (
    <div>
      <h1>Welcome, {session?.user?.name}!</h1>
      <p>Email: {session?.user?.email}</p>
      <p>Role: {session?.user?.role}</p>
      <p>Phone: {session?.user?.phone}</p>
    </div>
  );
}
```

### 2. Role-Based UI Rendering

```typescript
'use client';

import { useSession } from 'next-auth/react';

export default function Dashboard() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';
  const isResponder = session?.user?.role === 'responder';

  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Show to all authenticated users */}
      <button>Report Emergency</button>
      
      {/* Show only to responders and admins */}
      {(isResponder || isAdmin) && (
        <button>View All Emergencies</button>
      )}
      
      {/* Show only to admins */}
      {isAdmin && (
        <button onClick={() => router.push('/admin')}>
          Admin Panel
        </button>
      )}
    </div>
  );
}
```

### 3. Protecting API Routes (Server-Side)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  // Get session
  const session = await getServerSession(authOptions);

  // Check if authenticated
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized - Please sign in' },
      { status: 401 }
    );
  }

  // Check if admin
  if (session.user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Forbidden - Admin access required' },
      { status: 403 }
    );
  }

  // User is authenticated and authorized
  // Proceed with logic
  return NextResponse.json({ 
    message: 'Success',
    user: session.user 
  });
}
```

### 4. Custom Sign Out

```typescript
'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();

  const handleSignOut = async () => {
    // Confirm before signing out
    if (confirm('Are you sure you want to sign out?')) {
      await signOut({ 
        callbackUrl: '/auth/signin',
        redirect: true 
      });
    }
  };

  return (
    <header>
      <button onClick={handleSignOut}>
        Sign Out
      </button>
    </header>
  );
}
```

### 5. Programmatic Sign In

```typescript
'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function LoginForm() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = await signIn('credentials', {
      email: credentials.email,
      password: credentials.password,
      redirect: false, // Don't redirect automatically
    });

    if (result?.error) {
      setError(result.error);
    } else if (result?.ok) {
      // Manually redirect on success
      window.location.href = '/dashboard';
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      
      <input
        type="email"
        value={credentials.email}
        onChange={(e) => setCredentials({
          ...credentials,
          email: e.target.value
        })}
        placeholder="Email"
        required
      />
      
      <input
        type="password"
        value={credentials.password}
        onChange={(e) => setCredentials({
          ...credentials,
          password: e.target.value
        })}
        placeholder="Password"
        required
      />
      
      <button type="submit">Sign In</button>
    </form>
  );
}
```

### 6. Registering New Users

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'user'
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (data.success) {
      alert('Account created successfully!');
      router.push('/auth/signin');
    } else {
      alert(data.error || 'Registration failed');
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <input
        type="text"
        placeholder="Full Name"
        value={formData.name}
        onChange={(e) => setFormData({
          ...formData,
          name: e.target.value
        })}
        required
      />
      
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({
          ...formData,
          email: e.target.value
        })}
        required
      />
      
      <input
        type="tel"
        placeholder="Phone"
        value={formData.phone}
        onChange={(e) => setFormData({
          ...formData,
          phone: e.target.value
        })}
        required
      />
      
      <select
        value={formData.role}
        onChange={(e) => setFormData({
          ...formData,
          role: e.target.value
        })}
      >
        <option value="user">User</option>
        <option value="responder">Responder</option>
        <option value="admin">Admin</option>
      </select>
      
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({
          ...formData,
          password: e.target.value
        })}
        required
      />
      
      <button type="submit">Create Account</button>
    </form>
  );
}
```

### 7. Admin User Management

```typescript
'use client';

import { useState, useEffect } from 'react';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const response = await fetch('/api/admin/users');
    const data = await response.json();
    if (data.success) {
      setUsers(data.data);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole })
    });

    if (response.ok) {
      fetchUsers(); // Refresh list
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Delete this user?')) return;

    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      fetchUsers(); // Refresh list
    }
  };

  return (
    <div>
      <h1>User Management</h1>
      
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user: any) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <select
                  value={user.role}
                  onChange={(e) => updateUserRole(user._id, e.target.value)}
                >
                  <option value="user">User</option>
                  <option value="responder">Responder</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td>
                <button onClick={() => deleteUser(user._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### 8. Protecting Pages with Redirect

```typescript
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null; // Will redirect in useEffect
  }

  return (
    <div>
      <h1>Protected Content</h1>
      <p>Only visible to authenticated users</p>
    </div>
  );
}
```

### 9. Creating Admin-Only API Routes

```typescript
// app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import UserModel from '@/models/User';
import EmergencyModel from '@/models/Emergency';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check admin role
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Fetch admin statistics
    await connectDB();
    
    const totalUsers = await UserModel.countDocuments();
    const activeEmergencies = await EmergencyModel.countDocuments({
      status: { $in: ['pending', 'acknowledged', 'responding'] }
    });

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        activeEmergencies,
        adminName: session.user.name
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### 10. Custom Hook for Authentication

```typescript
// hooks/useAuth.ts
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useAuth(requiredRole?: string) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (requiredRole && session?.user?.role !== requiredRole) {
      router.push('/unauthorized');
    }
  }, [status, session, requiredRole, router]);

  return {
    user: session?.user,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    isAdmin: session?.user?.role === 'admin',
    isResponder: session?.user?.role === 'responder',
  };
}

// Usage:
export default function AdminPage() {
  const { user, isLoading, isAdmin } = useAuth('admin');

  if (isLoading) return <div>Loading...</div>;
  if (!isAdmin) return null;

  return <div>Admin Panel for {user?.name}</div>;
}
```

### 11. Password Validation

```typescript
// utils/validation.ts
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Usage in form:
const handlePasswordChange = (value: string) => {
  const validation = validatePassword(value);
  if (!validation.valid) {
    setPasswordErrors(validation.errors);
  } else {
    setPasswordErrors([]);
  }
  setPassword(value);
};
```

### 12. Session Refresh

```typescript
'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export default function SessionManager() {
  const { data: session, update } = useSession();

  useEffect(() => {
    // Refresh session every 5 minutes
    const interval = setInterval(() => {
      update();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [update]);

  // Manually refresh session
  const refreshSession = async () => {
    await update();
    alert('Session refreshed!');
  };

  return (
    <div>
      <button onClick={refreshSession}>
        Refresh Session
      </button>
    </div>
  );
}
```

These examples cover the most common authentication tasks you'll need in your Emergency Management System!
