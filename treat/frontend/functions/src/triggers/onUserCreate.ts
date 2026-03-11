import { auth as authFunctions } from "firebase-functions/v1";
import { db } from "../admin";

// Triggered when a new user is created in Firebase Auth
// Creates a corresponding user profile document in Firestore
export const onUserCreated = authFunctions.user().onCreate(async (user) => {
  const { uid, email, displayName, photoURL } = user;

  const userProfile = {
    uid,
    email: email || "",
    name: displayName || "",
    photoURL: photoURL || null,
    role: "user" as const,
    isVerified: user.emailVerified || false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.collection("users").doc(uid).set(userProfile);

  console.log(`User profile created for ${uid} (${email})`);
});
