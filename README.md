# Emergency Management System

A real-time emergency management system built with Next.js, MongoDB Atlas, Tailwind CSS, and Leaflet maps. This system receives real-time GPS data from mobile users and plots their locations on an interactive map for emergency response coordination.

## Features

- 📍 **Real-time GPS Tracking**: Track user locations in real-time
- 🗺️ **Interactive Maps**: Visualize emergencies and user locations using Leaflet
- 🚨 **Emergency Reporting**: Mobile-friendly emergency submission form
- 📊 **Live Dashboard**: Monitor all active emergencies with statistics
- 🔄 **Auto-refresh**: Automatic data updates every 5 seconds
- 📱 **Mobile Responsive**: Works seamlessly on mobile and desktop
- 🎯 **Emergency Types**: Support for medical, fire, crime, accident, and natural disasters
- ⚡ **Severity Levels**: Critical, high, medium, and low priority classification
- 👥 **User Tracking**: Monitor active users and their locations
- 🔐 **Authentication**: Secure login with NextAuth.js
- 👑 **Role-Based Access**: Admin, Responder, and User roles with different permissions
- 🛡️ **Admin Dashboard**: User management and system administration

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: NextAuth.js with JWT
- **Maps**: Leaflet + React Leaflet
- **Icons**: Lucide React
- **Date Utilities**: date-fns
- **Password Hashing**: bcryptjs

## Prerequisites

- Node.js 18+ and npm/yarn
- MongoDB Atlas account
- Modern web browser with geolocation support

## Installation

1. **Clone or extract the project**:
```bash
cd emergency-management
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up MongoDB Atlas**:
   - Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a new cluster
   - Click "Connect" and choose "Connect your application"
   - Copy the connection string

4. **Configure environment variables**:
   - Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
   - Edit `.env.local` and add your MongoDB connection string and NextAuth secret:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/emergency-db?retryWrites=true&w=majority
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
   ```
   - Generate a secure NextAuth secret:
   ```bash
   openssl rand -base64 32
   ```

5. **Seed demo users** (optional):
```bash
npm run seed
```
This creates three demo accounts:
- Admin: admin@example.com / admin123
- User: user@example.com / user123
- Responder: responder@example.com / responder123

6. **Run the development server**:
```bash
npm run dev
```

6. **Open your browser**:
   - Dashboard: http://localhost:3000
   - Report Emergency: http://localhost:3000/report

## Project Structure

```
emergency-management/
├── app/
│   ├── api/
│   │   ├── emergencies/
│   │   │   ├── route.ts          # List/create emergencies
│   │   │   └── [id]/route.ts     # Get/update emergency by ID
│   │   └── location/
│   │       └── route.ts          # Track user locations
│   ├── report/
│   │   └── page.tsx              # Emergency reporting form
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Dashboard page
│   └── globals.css               # Global styles
├── components/
│   ├── EmergencyForm.tsx         # Mobile emergency report form
│   ├── EmergencyList.tsx         # List view of emergencies
│   ├── EmergencyMap.tsx          # Interactive Leaflet map
│   └── StatsDashboard.tsx        # Statistics cards
├── lib/
│   └── mongodb.ts                # MongoDB connection utility
├── models/
│   ├── Emergency.ts              # Emergency Mongoose model
│   └── User.ts                   # User Mongoose model
├── types/
│   └── index.ts                  # TypeScript interfaces
├── public/                       # Static assets
├── .env.local.example            # Environment variables template
├── next.config.js                # Next.js configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies
```

## Usage

### Authentication

Access at `http://localhost:3000/auth/signin`

- Sign in with demo credentials or create a new account
- Three user roles available: Admin, Responder, User
- Role-based access to different features
- See AUTH.md for detailed authentication documentation

### Dashboard (Control Center)

Access at `http://localhost:3000` (requires authentication)

- View real-time emergency locations on the map
- See statistics: total emergencies, pending, active, resolved, critical, active users
- Switch between Map View and List View
- Auto-refresh toggle for live updates
- Update emergency status (acknowledge, respond, resolve)
- User menu with logout option

### Admin Dashboard

Access at `http://localhost:3000/admin` (requires admin role)

- View all registered users
- Manage user roles (User, Responder, Admin)
- Delete users
- View user statistics
- Monitor system activity

### Mobile Emergency Reporting

Access at `http://localhost:3000/report`

- Fill in personal information (name, phone)
- Select emergency type (medical, fire, crime, accident, natural disaster, other)
- Choose severity level (low, medium, high, critical)
- Add optional description
- Location is automatically detected via GPS
- Submit to alert emergency responders

## API Endpoints

### Emergencies

- `POST /api/emergencies` - Create new emergency
  ```json
  {
    "userId": "string",
    "userName": "string",
    "userPhone": "string",
    "location": {
      "latitude": number,
      "longitude": number,
      "accuracy": number
    },
    "emergencyType": "medical|fire|crime|accident|natural-disaster|other",
    "severity": "low|medium|high|critical",
    "description": "string"
  }
  ```

- `GET /api/emergencies` - Get all emergencies
  - Query params: `status` (filter), `limit` (default: 50)

- `GET /api/emergencies/[id]` - Get emergency by ID

- `PATCH /api/emergencies/[id]` - Update emergency status
  ```json
  {
    "status": "pending|acknowledged|responding|resolved|cancelled",
    "responderId": "string",
    "responderName": "string",
    "estimatedArrival": "ISO date string"
  }
  ```

### Location Tracking

- `POST /api/location` - Update user location
  ```json
  {
    "name": "string",
    "phone": "string",
    "location": {
      "latitude": number,
      "longitude": number,
      "accuracy": number
    }
  }
  ```

- `GET /api/location` - Get all users
  - Query params: `active=true` (filter active users)

## Database Schema

### Emergency Collection
```typescript
{
  userId: string
  userName: string
  userPhone: string
  location: {
    latitude: number
    longitude: number
    accuracy?: number
    timestamp: Date
  }
  emergencyType: 'medical' | 'fire' | 'crime' | 'accident' | 'natural-disaster' | 'other'
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'pending' | 'acknowledged' | 'responding' | 'resolved' | 'cancelled'
  description?: string
  responderId?: string
  responderName?: string
  estimatedArrival?: Date
  createdAt: Date
  updatedAt: Date
}
```

### User Collection
```typescript
{
  name: string
  phone: string (unique)
  email?: string
  currentLocation?: {
    latitude: number
    longitude: number
    accuracy?: number
    timestamp: Date
  }
  isActive: boolean
  lastSeen: Date
  createdAt: Date
  updatedAt: Date
}
```

## Customization

### Map Center
Change the default map center in `components/EmergencyMap.tsx`:
```typescript
center = [7.12345, 125.1234] // Manila, Philippines
```

### Refresh Interval
Modify auto-refresh interval in `app/page.tsx`:
```typescript
const interval = setInterval(() => {
  // ...
}, 5000); // 5 seconds
```

### Emergency Types
Add/modify emergency types in `types/index.ts` and update components accordingly.

## Production Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables (MONGODB_URI)
4. Deploy

### Other Platforms

1. Build the project:
```bash
npm run build
```

2. Start production server:
```bash
npm start
```

## Security Considerations

- Always use HTTPS in production
- Implement authentication/authorization
- Add rate limiting to API endpoints
- Validate all user inputs
- Encrypt sensitive data
- Use environment variables for secrets
- Implement CORS policies
- Add input sanitization

## Future Enhancements

- [ ] Real-time WebSocket updates
- [ ] SMS/Push notifications
- [ ] Responder assignment system
- [ ] Historical data analytics
- [ ] Route optimization for responders
- [ ] Multi-language support
- [ ] Voice emergency reporting
- [ ] Integration with emergency services
- [ ] Geofencing and alert zones
- [ ] Offline mode support

## License

MIT License - feel free to use this project for your needs.

## Support

For issues or questions, please open an issue in the repository.

---

**Note**: This system is designed for demonstration and educational purposes. For production use in real emergency scenarios, ensure proper security measures, compliance with local regulations, and integration with official emergency services.
