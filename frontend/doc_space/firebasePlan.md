# Migration Guide: From GitHub Pages to Dynamic Firebase Hosting

This guide provides a complete, step-by-step plan for migrating your Next.js application from its **current setup** (a static site on GitHub Pages) to a **new setup** (a dynamic, Server-Side Rendered application on Firebase with Redis caching).

### Architecture Overview

-   **Current**: Static HTML/CSS/JS files hosted on GitHub Pages.
-   **New**: A dynamic Next.js server running in a Cloud Function, with Firebase Hosting as the CDN and a Redis cache for performance.

### Migration Checklist

- [X] **Step 1: Disable Static Export Configuration**
- [X] **Step 2: Add Client-Side Firebase SDK**
- [ ] **Step 3: Initialize Firebase in Your Project**
- [ ] **Step 4: Restructure Project for Firebase**
- [ ] **Step 5: Implement Redis Caching & Secure Keys**
- [ ] **Step 6: Create the Firebase Cloud Function**
- [ ] **Step 7: Configure and Deploy to Firebase**
- [ ] **Step 8: Replace CI/CD for Automatic Deployment**

---

## Detailed Migration Steps

### Step 1: Disable Static Export Configuration

-   **Status**: ✅ **Completed**
-   **Migration Task**: I modified your project to produce a dynamic server instead of static files.
-   **Details**: I confirmed your `package.json` and `next.config.ts` are correctly configured for SSR, which is the first step in moving away from the static GitHub Pages setup.

### Step 2: Add Client-Side Firebase SDK

-   **Status**: ✅ **Completed**
-   **Migration Task**: I added the necessary Firebase libraries to your application frontend.
-   **Details**: I installed the `firebase` package and created `src/lib/firebase.ts`. You must create the corresponding `.env.local` file for the client-side app to connect to Firebase services.

### Step 3: Initialize Firebase in Your Project

-   **Status**: ⏳ **Pending**
-   **Migration Task**: This step creates the Firebase configuration files that will replace your old deployment method.
-   **Your Action**: Run `firebase init` in your terminal and answer the questions as follows.
-   **Command**: `firebase init`
-   **Instructions**:
    1.  **Features**: Select `Functions` and `Hosting`.
    2.  **Project**: Use an existing project (`onestopcentre-c99ed`).
    3.  **Language**: TypeScript.
    4.  **ESLint**: Yes.
    5.  **Install dependencies**: Yes.
    6.  **Public directory**: `.` (a single dot).
    7.  **Single-page app**: No.
    8.  **GitHub deploys**: No (we will do this in a later step).

### Step 4: Restructure Project for Firebase

-   **Status**: ⏳ **Pending**
-   **Migration Task**: Your project's file structure needs to be adapted to work with Cloud Functions.
-   **Details**: After `firebase init` is complete, move your Next.js application files into the newly created `functions` directory. This is necessary because the entire server application will be deployed as a single Cloud Function.
-   **Files to Move**: `src`, `public`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `tsconfig.json`, `package.json`, `package-lock.json`, `eslint.config.mjs`.

### Step 5: Implement Redis Caching & Secure Keys

-   **Status**: ⏳ **Pending**
-   **Migration Task**: Integrate the Redis cache, which was not possible in the old static setup.
-   **Your Action**:
    1.  **Get a Redis URL**: Sign up for a Redis provider like [Upstash](https://upstash.com/) and get your database connection URL.
    2.  **Install Redis Client**: In your **`functions`** directory, run `npm install ioredis`.
    3.  **Secure the Redis URL**: From your project root, run the following command to securely store your Redis URL:
        ```bash
        firebase functions:secrets:set REDIS_URL
        ```

### Step 6: Create the Firebase Cloud Function

-   **Status**: ⏳ **Pending**
-   **Migration Task**: Create the server-side entry point for Firebase to run your Next.js app.
-   **Your Action**: Replace the contents of `functions/src/index.ts` with the code below, which is specially written to load the Redis secret before starting the app.
        ```typescript
        import * as functions from "firebase-functions";
        import next from "next";

        const dev = process.env.NODE_ENV !== "production";
        const app = next({ dev, conf: { distDir: ".next" } });
        const handle = app.getRequestHandler();

        export const nextServer = functions.runWith({ secrets: ["REDIS_URL"] })
          .https.onRequest((req, res) => {
            // The secret is automatically available as process.env.REDIS_URL
            return app.prepare().then(() => handle(req, res));
        });
        ```

### Step 7: Configure and Deploy to Firebase

-   **Status**: ⏳ **Pending**
-   **Migration Task**: This is the final deployment step that sends your new, dynamic application to Firebase.
-   **Your Action**:
    1.  **Configure `firebase.json`**: In the root of your project, ensure `firebase.json` is configured to send all traffic to your new cloud function.
    2.  **Deploy**: From the root of your project, run the deploy command:
        ```bash
        firebase deploy --only hosting,functions
        ```

### Step 8: Replace CI/CD for Automatic Deployment

-   **Status**: ⏳ **Pending**
-   **Migration Task**: Replace your old GitHub Pages deployment workflow with a new one for Firebase.
-   **Your Action**: After a successful manual deployment, run `firebase init hosting:github` to create a new GitHub Actions workflow.