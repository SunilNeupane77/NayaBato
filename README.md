# NayaBato

**Civic Engagement Platform for Community Issue Management**

A comprehensive full-stack web application that connects citizens with local authorities, enabling efficient reporting, tracking, and resolution of community issues through a modern digital platform.

## Overview

NayaBato is built with Next.js 15 and provides role-based access for citizens, administrators, and officials. The platform features real-time issue tracking, interactive mapping, automated notifications, and comprehensive analytics for effective civic engagement.

## Technology Stack

**Frontend**
- Next.js 15.5.9 with App Router
- React 19
- Tailwind CSS
- Lucide React
- Radix UI / Shadcn/ui
- React Leaflet (Maps)
- Recharts (Analytics)

**Backend**
- Next.js API Routes
- MongoDB Atlas Database
- NextAuth.js (Authentication)
- Nodemailer (Email Service)
- Cloudinary (Media Management)

## Quick Start

```bash
git clone https://github.com/SunilNeupane77/NayaBato.git
cd NayaBato
npm install
cp .env.example .env.local
npm run dev
```

Access the application at `http://localhost:3000`

## Environment Configuration

Create `.env.local` with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/nayabato

# Authentication
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Cloudinary Media Storage
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Service (SMTP)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@nayabato.com

# Optional: Additional Configuration
NODE_ENV=development
```

## Project Structure

```
nayabato/
├── app/                          # Next.js App Router
│   ├── api/                      # Backend API endpoints
│   │   ├── admin/               # Admin management APIs
│   │   ├── auth/                # Authentication APIs
│   │   ├── citizen/             # Citizen-specific APIs
│   │   ├── official/            # Official dashboard APIs
│   │   ├── issues/              # Issue management APIs
│   │   ├── departments/         # Department management
│   │   ├── wards/               # Ward administration
│   │   ├── users/               # User management
│   │   ├── notifications/       # Notification system
│   │   └── analytics/           # Analytics and reporting
│   ├── admin/                   # Admin dashboard pages
│   │   ├── dashboard/           # Main admin dashboard
│   │   ├── users/               # User management
│   │   ├── departments/         # Department administration
│   │   ├── wards/               # Ward management
│   │   ├── analytics/           # System analytics
│   │   ├── audit/               # Audit logs
│   │   └── sessions/            # Session management
│   ├── auth/                    # Authentication pages
│   │   ├── signin/              # Login page
│   │   ├── register/            # Registration
│   │   ├── forgot-password/     # Password recovery
│   │   ├── reset-password/      # Password reset
│   │   └── verify-otp/          # OTP verification
│   ├── citizen/                 # Citizen portal
│   │   ├── dashboard/           # Citizen dashboard
│   │   ├── community/           # Community issues
│   │   └── my-reports/          # Personal reports
│   ├── official/                # Official dashboard
│   │   ├── dashboard/           # Official overview
│   │   ├── issues/              # Issue management
│   │   ├── users/               # User oversight
│   │   └── wards/               # Ward administration
│   ├── issues/                  # Issue management
│   │   ├── report/              # Issue reporting
│   │   └── [id]/                # Individual issue pages
│   ├── profile/                 # User profile management
│   └── notifications/           # Notification center
├── components/                   # React components
│   ├── ui/                      # Base UI components
│   ├── forms/                   # Form components
│   ├── maps/                    # Map integration
│   ├── dashboard/               # Dashboard components
│   └── layout/                  # Layout components
├── lib/                         # Utility libraries
│   ├── auth.js                  # Authentication config
│   ├── db.js                    # Database connection
│   ├── email.js                 # Email service
│   └── utils.js                 # Helper functions
├── models/                      # MongoDB schemas
│   ├── User.js                  # User model
│   ├── Issue.js                 # Issue model
│   ├── Department.js            # Department model
│   ├── Ward.js                  # Ward model
│   ├── Comment.js               # Comment model
│   ├── Notification.js          # Notification model
│   └── Audit.js                 # Audit log model
├── public/                      # Static assets
└── middleware.js                # Next.js middleware
```

## Core Features

### Citizen Portal
- Issue reporting with photo uploads and location mapping
- Real-time status tracking and progress updates
- Community issue browsing and engagement
- Email notifications and in-app alerts
- Personal dashboard with report history

### Administrative Dashboard
- Comprehensive analytics and reporting
- User management and role assignment
- Department and ward administration
- System audit logs and activity monitoring
- Bulk operations and data management

### Official Interface
- Department-specific issue management
- Ward-based issue assignment and tracking
- User oversight and communication tools
- Performance metrics and reporting

### Communication System
- Automated email notifications
- Weekly digest reports
- Two-way commenting system
- Real-time status updates
- OTP-based verification

## Haversine Algorithm Implementation

The platform uses the Haversine formula for accurate distance calculations and automatic ward assignment based on geographical coordinates.

### Core Implementation

```javascript
// lib/location-utils.js
export function haversineDistance(coords1, coords2) {
  const R = 6371000; // Earth's radius in meters
  
  const [lon1, lat1] = coords1;
  const [lon2, lat2] = coords2;
  
  // Convert to radians
  const radLat1 = (Math.PI * lat1) / 180;
  const radLat2 = (Math.PI * lat2) / 180;
  const radDeltaLat = (Math.PI * (lat2 - lat1)) / 180;
  const radDeltaLon = (Math.PI * (lon2 - lon1)) / 180;
  
  // Haversine formula
  const a = 
    Math.sin(radDeltaLat / 2) * Math.sin(radDeltaLat / 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * 
    Math.sin(radDeltaLon / 2) * Math.sin(radDeltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c; // Distance in meters
}
```

### Ward Assignment Logic

```javascript
// lib/ward-assignment.js
export async function findNearestWardHaversine(coordinates, maxDistance = 10000) {
  const wards = await Ward.find({ isActive: true }).lean();
  
  let nearestWard = null;
  let minDistance = Infinity;
  
  for (const ward of wards) {
    if (ward.location?.coordinates?.coordinates) {
      const distance = haversineDistance(coordinates, ward.location.coordinates.coordinates);
      
      if (distance < minDistance && distance <= maxDistance) {
        minDistance = distance;
        nearestWard = ward;
      }
    }
  }
  
  return nearestWard ? { ward: nearestWard, distance: Math.round(minDistance) } : null;
}
```

### Usage in Issue Assignment

```javascript
// Automatic ward assignment when issue is created
export async function assignWardToIssue(coordinates) {
  // Primary: Haversine algorithm
  const haversineResult = await findNearestWardHaversine(coordinates);
  
  if (haversineResult) {
    return {
      success: true,
      ward: haversineResult.ward,
      distance: haversineResult.distance,
      method: 'haversine'
    };
  }
  
  // Fallback: MongoDB geospatial query
  const nearestWards = await Ward.findNearest(coordinates, 15000);
  
  return nearestWards?.length > 0 ? {
    success: true,
    ward: nearestWards[0],
    method: 'mongodb_geo'
  } : { success: false };
}
```

### Key Features

- **Accurate Distance Calculation**: Uses Earth's curvature for precise measurements
- **Automatic Ward Assignment**: Issues automatically assigned to nearest ward within 10km radius
- **Fallback Strategy**: MongoDB geospatial queries as backup method
- **Performance Optimized**: Efficient calculation for real-time assignment
- **Configurable Radius**: Adjustable maximum distance for ward assignment

## Database Models

**User Management**
- Users (Citizens, Admins, Officials)
- Authentication and authorization
- Profile management and preferences

**Issue Management**
- Issues with location and media attachments
- Comments and status updates
- Priority and category classification

**Administrative**
- Departments and ward organization
- Notification and audit systems
- Analytics and reporting data

## API Endpoints

The application provides comprehensive REST APIs:

- `/api/auth/*` - Authentication and user management
- `/api/admin/*` - Administrative functions
- `/api/citizen/*` - Citizen-specific operations
- `/api/official/*` - Official dashboard APIs
- `/api/issues/*` - Issue management
- `/api/departments/*` - Department administration
- `/api/wards/*` - Ward management
- `/api/notifications/*` - Notification system
- `/api/analytics/*` - Reporting and analytics

## Development Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Code linting
npm run lint

# Type checking
npm run type-check
```

## Production Deployment

### Docker Deployment
```bash
docker-compose up --build
```

### Manual Deployment
```bash
npm run build
npm start
```

### Environment Requirements
- Node.js 22.16.0 or higher
- MongoDB 4.4 or higher
- SMTP server for email functionality
- Cloudinary account for media storage

## Security Features

- JWT-based session management
- bcrypt password hashing
- Role-based access control
- CSRF protection
- Input validation and sanitization
- Secure file upload handling

## Performance Optimizations

- Server-side rendering with Next.js
- Static page generation where applicable
- Image optimization through Cloudinary
- Code splitting and lazy loading
- Efficient database queries with indexing

## Monitoring and Analytics

- User activity tracking
- Issue resolution metrics
- Department performance analytics
- System health monitoring
- Audit trail for all operations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Submit a pull request
5. Ensure CI/CD pipeline passes

## License

MIT License - see LICENSE file for details.

## Support

For technical support or questions:
- Create an issue on GitHub
- Review the documentation
- Contact the development team

---

**Version**: 2.1.0  
**Build Size**: ~178kB (optimized)  
**Routes**: 103 static/dynamic pages  
**Last Updated**: December 2025
