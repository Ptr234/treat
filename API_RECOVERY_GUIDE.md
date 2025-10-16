# API Routes Recovery Guide

## Overview
This document contains instructions to restore the API routes and Firebase functions that were temporarily disabled for static export deployment.

## Current Status (October 16, 2025)
- **Main API Routes**: Moved to `src/app/api-disabled/` (temporarily)
- **Firebase Functions**: Moved to `../functions-backup/` (outside project)
- **Reason**: Static export (`output: 'export'`) doesn't support API routes

## Files Backed Up

### 1. Main Project API Routes
**Location**: `src/app/api-disabled/`
**Contains**:
- `/investments/route.ts` - Investment opportunities API
- `/investments/[id]/route.ts` - Individual investment details
- `/contact/route.ts` - Contact form submission
- Other API endpoints

### 2. Firebase Functions
**Location**: `../functions-backup/`
**Contains**:
- Complete Firebase Functions setup
- `src/index.ts` - Main Cloud Function entry point
- `src/lib/firebaseAdmin.ts` - Firebase Admin SDK
- `src/services/` - Business logic services
- `src/middleware/` - Authentication middleware
- `package.json` - Dependencies and scripts

## Recovery Process

### Step 1: Restore API Routes (For Server-Side Rendering)
```bash
# Move API routes back
mv src/app/api-disabled src/app/api

# Update next.config.ts to remove static export
# Change: output: 'export' → remove this line
# This enables server-side rendering with API routes
```

### Step 2: Restore Firebase Functions
```bash
# Move functions back into project
mv ../functions-backup ./functions

# Install function dependencies
cd functions
npm install
cd ..

# Update firebase.json to include functions deployment
# The hosting should point to the Next.js function instead of static files
```

### Step 3: Update Firebase Configuration

**firebase.json** changes needed:
```json
{
  "functions": {
    "source": "functions",
    "predeploy": [
      "npm --prefix \"$RESOURCE_DIR\" run build"
    ],
    "runtime": "nodejs18"
  },
  "hosting": {
    "public": "out",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "function": "nextServer"
      }
    ]
  }
}
```

### Step 4: Update Deployment Strategy

**For Full-Stack Deployment (with API routes)**:
```bash
# Requires Firebase Blaze plan
npm run firebase:deploy
```

**For Static-Only Deployment (current)**:
```bash
npm run firebase:deploy:hosting
```

## Environment Variables Required

### For Firebase Functions
- `REDIS_URL` - Redis connection string
- `FIREBASE_ADMIN_KEY` - Firebase admin service account

### For Main App
- All `NEXT_PUBLIC_FIREBASE_*` variables (already configured)

## Deployment Options

### Option A: Static Site (Current - Working)
- ✅ Fast deployment
- ✅ Free Firebase Spark plan
- ❌ No API routes
- ❌ No server-side features

### Option B: Full-Stack App (Future)
- ✅ Complete functionality
- ✅ API routes and server features
- ❌ Requires Firebase Blaze plan
- ❌ More complex deployment

## Recovery Commands

### Quick Static Recovery (Current Setup)
```bash
# If API routes were accidentally restored
mv src/app/api src/app/api-disabled
npm run build
firebase deploy --only hosting
```

### Full Functionality Recovery
```bash
# Restore everything
mv src/app/api-disabled src/app/api
mv ../functions-backup ./functions

# Update next.config.ts (remove output: 'export')
# Update firebase.json (use function rewrites)

# Deploy full stack (requires Blaze plan)
firebase deploy
```

## File Locations Reference

### Current Structure (Static)
```
src/
├── app/
│   ├── api-disabled/     # ← API routes here
│   ├── (other pages)
├── components/
├── data/
└── types/

../functions-backup/      # ← Firebase functions here
```

### Target Structure (Full-Stack)
```
src/
├── app/
│   ├── api/             # ← API routes here
│   ├── (other pages)
├── components/
├── data/
└── types/

functions/               # ← Firebase functions here
├── src/
├── package.json
└── tsconfig.json
```

## Important Notes

1. **Domain Setup**: Custom domain `oscdigitaltool.com` works with both static and full-stack
2. **Data Persistence**: All verified Uganda investment data is preserved in `/src/data/`
3. **Components**: All React components work in both modes
4. **Styling**: Tailwind CSS and brand colors preserved
5. **Template**: AI Consulting template layout preserved

## Contact Information
- Project: OneStopCentre Uganda
- Firebase Project ID: onestopcentre-c99ed
- Live URL: https://onestopcentre-c99ed.web.app
- Custom Domain: oscdigitaltool.com (pending verification)

---
**Created**: October 16, 2025  
**Purpose**: Backup strategy for API routes and Firebase functions  
**Status**: Static deployment active, full-stack components preserved