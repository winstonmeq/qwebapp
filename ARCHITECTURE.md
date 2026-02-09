# System Architecture

## Overview

The Emergency Management System is built on a modern, scalable architecture using Next.js 14 with MongoDB Atlas for data persistence and real-time GPS tracking capabilities.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐        ┌──────────────────┐          │
│  │   Dashboard      │        │  Mobile App      │          │
│  │   (Control       │        │  (Report         │          │
│  │   Center)        │        │  Emergency)      │          │
│  │                  │        │                  │          │
│  │  - Map View      │        │  - GPS Capture   │          │
│  │  - List View     │        │  - Form Submit   │          │
│  │  - Statistics    │        │  - Real-time     │          │
│  │  - Auto-refresh  │        │    Location      │          │
│  └────────┬─────────┘        └────────┬─────────┘          │
│           │                           │                     │
└───────────┼───────────────────────────┼─────────────────────┘
            │                           │
            └───────────┬───────────────┘
                        │
┌───────────────────────┼─────────────────────────────────────┐
│                  APPLICATION LAYER                           │
├───────────────────────┼─────────────────────────────────────┤
│                       │                                      │
│              ┌────────▼────────┐                            │
│              │   Next.js 14    │                            │
│              │   App Router    │                            │
│              │                 │                            │
│              │  ┌───────────┐  │                            │
│              │  │   Pages   │  │                            │
│              │  ├───────────┤  │                            │
│              │  │ Components│  │                            │
│              │  ├───────────┤  │                            │
│              │  │API Routes │  │                            │
│              │  └───────────┘  │                            │
│              └────────┬────────┘                            │
│                       │                                      │
└───────────────────────┼─────────────────────────────────────┘
                        │
┌───────────────────────┼─────────────────────────────────────┐
│                    API LAYER                                 │
├───────────────────────┼─────────────────────────────────────┤
│                       │                                      │
│    ┌──────────────────▼──────────────────┐                 │
│    │      API Endpoints (REST)           │                 │
│    ├─────────────────────────────────────┤                 │
│    │  /api/emergencies                   │                 │
│    │  - POST   Create emergency          │                 │
│    │  - GET    List emergencies          │                 │
│    │                                     │                 │
│    │  /api/emergencies/[id]              │                 │
│    │  - GET    Get emergency             │                 │
│    │  - PATCH  Update status             │                 │
│    │                                     │                 │
│    │  /api/location                      │                 │
│    │  - POST   Update location           │                 │
│    │  - GET    List active users         │                 │
│    └──────────────────┬──────────────────┘                 │
│                       │                                      │
└───────────────────────┼─────────────────────────────────────┘
                        │
┌───────────────────────┼─────────────────────────────────────┐
│                   DATA LAYER                                 │
├───────────────────────┼─────────────────────────────────────┤
│                       │                                      │
│              ┌────────▼────────┐                            │
│              │   Mongoose ODM  │                            │
│              │                 │                            │
│              │  ┌───────────┐  │                            │
│              │  │  Models   │  │                            │
│              │  ├───────────┤  │                            │
│              │  │ Emergency │  │                            │
│              │  │   User    │  │                            │
│              │  └───────────┘  │                            │
│              └────────┬────────┘                            │
│                       │                                      │
│              ┌────────▼────────┐                            │
│              │  MongoDB Atlas  │                            │
│              │                 │                            │
│              │  Collections:   │                            │
│              │  - emergencies  │                            │
│              │  - users        │                            │
│              └─────────────────┘                            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Components

```
App Router Structure:
├── app/
│   ├── page.tsx                    # Dashboard (Main)
│   ├── layout.tsx                  # Root Layout
│   ├── globals.css                 # Global Styles
│   ├── report/
│   │   └── page.tsx                # Emergency Report Form
│   └── api/
│       ├── emergencies/
│       │   ├── route.ts            # CRUD operations
│       │   └── [id]/route.ts       # Single emergency ops
│       └── location/
│           └── route.ts            # Location tracking

Components:
├── EmergencyMap.tsx                # Leaflet map with markers
├── EmergencyList.tsx               # List view of emergencies
├── StatsDashboard.tsx              # Statistics cards
└── EmergencyForm.tsx               # Mobile submission form
```

## Data Flow

### Emergency Creation Flow

```
1. User (Mobile)
   ↓ (Opens /report page)
2. Browser requests GPS location
   ↓ (User grants permission)
3. GPS coordinates captured
   ↓ (User fills form + submits)
4. POST /api/emergencies
   ↓ (Server receives request)
5. Mongoose validates data
   ↓ (Validation passes)
6. MongoDB saves emergency
   ↓ (Returns saved document)
7. API returns success
   ↓ (Client receives response)
8. User sees confirmation
```

### Real-time Location Tracking

```
1. GPS Simulator / Mobile App
   ↓ (Every 5 seconds)
2. navigator.geolocation.getCurrentPosition()
   ↓ (GPS data obtained)
3. POST /api/location
   ↓ (Server processes)
4. Upsert user document
   ↓ (Update or create)
5. MongoDB updates user location
   ↓
6. Dashboard auto-refresh
   ↓ (Every 5 seconds)
7. GET /api/location?active=true
   ↓ (Returns active users)
8. Map updates markers
```

### Dashboard Polling

```
┌──────────────┐
│  Dashboard   │
└──────┬───────┘
       │
       │ (Auto-refresh: 5 seconds)
       ├─────► GET /api/emergencies
       │          ↓
       │       MongoDB Query
       │          ↓
       │       Return emergencies[]
       │          ↓
       ├─────► Update EmergencyList
       │
       ├─────► GET /api/location
       │          ↓
       │       MongoDB Query
       │          ↓
       │       Return users[]
       │          ↓
       └─────► Update Map Markers
```

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Maps**: Leaflet + React Leaflet
- **Icons**: Lucide React
- **Date Utils**: date-fns

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes (REST)
- **Database ODM**: Mongoose
- **Validation**: Built-in Mongoose validators

### Database
- **Provider**: MongoDB Atlas (Cloud)
- **Collections**:
  - `emergencies`: Emergency reports
  - `users`: User tracking data

### Infrastructure
- **Hosting**: Vercel (recommended)
- **CDN**: Vercel Edge Network
- **SSL**: Automatic HTTPS

## Security Layers

```
┌─────────────────────────────────────┐
│       Client-Side Security          │
├─────────────────────────────────────┤
│  - HTTPS only                       │
│  - Input validation                 │
│  - GPS permission required          │
│  - CORS policy enforcement          │
└─────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────┐
│      Application Security           │
├─────────────────────────────────────┤
│  - Environment variables            │
│  - API route protection             │
│  - Request validation               │
│  - Error handling                   │
└─────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────┐
│       Database Security             │
├─────────────────────────────────────┤
│  - MongoDB Atlas encryption         │
│  - IP whitelist                     │
│  - Authentication required          │
│  - Automated backups                │
└─────────────────────────────────────┘
```

## Scalability Considerations

### Current Architecture
- Suitable for: 100-1000 concurrent users
- Database: MongoDB Atlas M0 (Free tier)
- Hosting: Vercel Hobby plan

### Scaling Strategy

1. **Horizontal Scaling** (10K+ users):
   - Upgrade MongoDB cluster
   - Use Vercel Pro for better compute
   - Implement caching (Redis)
   - Add load balancing

2. **Real-time Updates** (Future):
   - WebSocket implementation
   - Socket.io integration
   - Pub/Sub pattern
   - Real-time notifications

3. **Performance Optimization**:
   - Database indexing (already implemented)
   - Image optimization
   - Code splitting
   - CDN for static assets

## Monitoring & Analytics

### Recommended Tools
- **Error Tracking**: Sentry
- **Performance**: Vercel Analytics
- **Database**: MongoDB Atlas monitoring
- **Logs**: Vercel Logs

### Key Metrics to Track
- Emergency response time
- GPS accuracy
- API latency
- User locations updated/min
- Database query performance

## Future Enhancements

1. **Real-time Communication**
   - WebSocket integration
   - Push notifications
   - SMS alerts

2. **Advanced Features**
   - Route optimization
   - Predictive analytics
   - Geofencing
   - Offline mode

3. **Integration**
   - Emergency services APIs
   - Weather data
   - Traffic information
   - Hospital/station locations

4. **Mobile Apps**
   - React Native apps
   - Native GPS integration
   - Background location tracking
   - Offline capabilities
