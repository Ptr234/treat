# Firebase Deployment Guide

This guide documents the complete Firebase implementation for the Uganda One Stop Centre Next.js application, including authentication, database, storage, and deployment.

## Overview

The application has been migrated from static GitHub Pages hosting to a dynamic Firebase setup with:
- **Firebase Hosting**: CDN and static asset serving
- **Cloud Functions**: Server-side rendering with Next.js
- **Firebase Authentication**: User management and security
- **Firestore Database**: Document-based data storage
- **Redis Caching**: Performance optimization
- **Cloud Storage**: File uploads and media management

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│                 │    │                  │    │                 │
│ Firebase        │────│ Cloud Functions  │────│ Next.js App     │
│ Hosting         │    │ (Server)         │    │ (SSR)           │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│                 │    │                  │    │                 │
│ Firebase        │    │ Firestore        │    │ Redis Cache     │
│ Auth            │    │ Database         │    │ (Upstash)       │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Project Structure

```
/
├── firebase.json                 # Firebase configuration
├── .firebaserc                  # Firebase project settings
├── .env.local                   # Environment variables
├── functions/                   # Cloud Functions
│   ├── package.json            # Functions dependencies
│   ├── tsconfig.json           # TypeScript config
│   ├── .eslintrc.js            # ESLint config
│   └── src/                    # Source code
│       ├── index.ts            # Main function entry
│       ├── lib/                # Core libraries
│       │   ├── firebase.ts     # Client Firebase config
│       │   ├── firebaseAdmin.ts # Server Firebase config
│       │   └── redis.ts        # Redis client
│       ├── services/           # Business logic
│       │   ├── authService.ts  # Authentication
│       │   └── investmentService.ts # Investment data
│       ├── utils/              # Utilities
│       │   └── enhancedCacheManager.ts # Caching
│       └── app/                # Next.js application
│           └── api/            # API routes
│               ├── auth/       # Authentication endpoints
│               └── investments/ # Investment endpoints
└── README.md
```

## Environment Configuration

### Client-side Environment Variables (.env.local)

```env
# Firebase Configuration (Client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=onestopcentre-c99ed.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=onestopcentre-c99ed
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=onestopcentre-c99ed.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Environment
NODE_ENV=production
```

### Server-side Secrets (Firebase Functions)

```bash
# Set Redis URL as a Firebase Function secret
firebase functions:secrets:set REDIS_URL
```

## Key Components

### 1. Firebase Configuration

**Client-side (`functions/src/lib/firebase.ts`)**
- Initializes Firebase app for browser usage
- Configures Auth, Firestore, Storage, and Analytics
- Includes emulator connections for development

**Server-side (`functions/src/lib/firebaseAdmin.ts`)**
- Initializes Firebase Admin SDK
- Provides server-side authentication and database access
- Includes helper methods for common operations

### 2. Authentication System

**Service (`functions/src/services/authService.ts`)**
- User registration and login
- Profile management
- Password reset functionality
- JWT token verification

**API Routes (`functions/src/app/api/auth/`)**
- `/api/auth/register` - User registration
- `/api/auth/login` - User authentication
- `/api/auth/profile` - Profile management

### 3. Investment Management

**Service (`functions/src/services/investmentService.ts`)**
- Investment application submission
- Application status tracking
- Investment inquiries
- Statistics and reporting

**API Routes (`functions/src/app/api/investments/`)**
- `/api/investments` - List investments with caching
- `/api/investments/apply` - Submit applications
- `/api/investments/[id]` - Individual investment details

### 4. Caching System

**Redis Integration (`functions/src/lib/redis.ts`)**
- Redis client initialization
- Connection management
- Error handling

**Cache Manager (`functions/src/utils/enhancedCacheManager.ts`)**
- Dual-layer caching (Redis + Memory)
- Cache key generation
- TTL management
- Fallback mechanisms

## Database Schema

### Users Collection (`users`)

```typescript
{
  uid: string;                    // Firebase Auth UID
  email: string;                  // User email
  displayName: string | null;     // User display name
  role: 'user' | 'admin';        // User role
  isActive: boolean;              // Account status
  preferences: {
    notifications: boolean;
    newsletter: boolean;
    theme: 'light' | 'dark';
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Investment Applications (`investment_applications`)

```typescript
{
  userId: string;                 // Reference to user
  investmentId: string;           // Investment opportunity ID
  applicantName: string;          // Applicant name
  email: string;                  // Contact email
  phone: string;                  // Contact phone
  company?: string;               // Company name (optional)
  investmentAmount: number;       // Investment amount
  businessPlan?: string;          // Business plan details
  experience?: string;            // Investment experience
  status: 'submitted' | 'under-review' | 'approved' | 'rejected';
  submittedAt: Timestamp;
  reviewedAt?: Timestamp;
  reviewedBy?: string;
  reviewNotes?: string;
  documents?: Array<{
    name: string;
    url: string;
    uploadedAt: Timestamp;
  }>;
}
```

### Investment Inquiries (`investment_inquiries`)

```typescript
{
  investmentId: string;           // Investment opportunity ID
  name: string;                   // Inquirer name
  email: string;                  // Contact email
  phone?: string;                 // Contact phone
  message: string;                // Inquiry message
  status: 'new' | 'responded' | 'closed';
  submittedAt: Timestamp;
  respondedAt?: Timestamp;
}
```

## Deployment

### Prerequisites

1. **Firebase CLI**: `npm install -g firebase-tools`
2. **Firebase Project**: Set up at [Firebase Console](https://console.firebase.google.com)
3. **Redis Database**: Sign up at [Upstash](https://upstash.com)

### Setup Steps

1. **Install Dependencies**
   ```bash
   # Root dependencies
   npm install
   
   # Functions dependencies
   cd functions && npm install
   ```

2. **Configure Environment**
   ```bash
   # Copy and update .env.local with your Firebase config
   cp .env.local.example .env.local
   ```

3. **Set Firebase Secrets**
   ```bash
   # Set Redis URL
   firebase functions:secrets:set REDIS_URL
   ```

4. **Build and Deploy**
   ```bash
   # Build functions
   npm run firebase:build
   
   # Deploy everything
   npm run firebase:deploy
   
   # Or deploy individually
   npm run firebase:deploy:hosting
   npm run firebase:deploy:functions
   ```

### Available Scripts

```bash
# Development
npm run dev                      # Start Next.js dev server
npm run firebase:serve          # Start Firebase emulators

# Building
npm run build                   # Build Next.js app
npm run firebase:build         # Build Cloud Functions

# Deployment
npm run firebase:deploy         # Deploy hosting and functions
npm run firebase:deploy:hosting # Deploy hosting only
npm run firebase:deploy:functions # Deploy functions only

# Testing
npm run test                    # Run tests
npm run lint                    # Lint code
```

## Security Rules

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read/write their own applications
    match /investment_applications/{applicationId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow read: if request.auth != null && 
        'admin' in request.auth.token && request.auth.token.admin == true;
    }
    
    // Anyone can create inquiries, admins can read all
    match /investment_inquiries/{inquiryId} {
      allow create: if true;
      allow read: if request.auth != null && 
        'admin' in request.auth.token && request.auth.token.admin == true;
    }
  }
}
```

### Storage Security Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /applications/{applicationId}/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Monitoring and Maintenance

### Performance Monitoring

- **Firebase Performance**: Automatic performance tracking
- **Redis Monitoring**: Cache hit rates and performance
- **Function Logs**: Cloud Functions execution logs

### Cache Management

- **Automatic TTL**: Caches expire automatically
- **Cache Invalidation**: Manual cache clearing for updates
- **Fallback System**: Memory cache when Redis is unavailable

### Error Handling

- **Graceful Degradation**: System continues without cache
- **Error Logging**: Comprehensive error tracking
- **User Feedback**: Clear error messages for users

## Support and Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Ensure `.env.local` is in the root directory
   - Verify variable names start with `NEXT_PUBLIC_`

2. **Firebase Authentication Errors**
   - Check Firebase project configuration
   - Verify API keys and domain settings

3. **Redis Connection Issues**
   - Confirm Redis URL is set as Firebase secret
   - Check Upstash dashboard for connection limits

4. **Deployment Failures**
   - Ensure Firebase CLI is authenticated
   - Check Functions build process for errors

### Getting Help

- **Firebase Documentation**: [firebase.google.com/docs](https://firebase.google.com/docs)
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)
- **Project Issues**: [GitHub Issues](https://github.com/Ptr234/treat/issues)

## Migration Notes

The application has been successfully migrated from static GitHub Pages to dynamic Firebase hosting. Key changes include:

1. **Static Export Disabled**: Removed `output: 'export'` from Next.js config
2. **API Routes Enabled**: Now supports server-side API endpoints
3. **Database Integration**: Firestore for persistent data storage
4. **Authentication Added**: Firebase Auth for user management
5. **Caching Implemented**: Redis for performance optimization
6. **File Structure**: Functions directory contains the application

This setup provides a scalable, secure, and performant foundation for the Uganda One Stop Centre platform.