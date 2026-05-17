import * as admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// Look for the service account key (production path takes priority)
let serviceAccountPath = path.resolve(__dirname, '../../serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
  // Fallback for local development
  serviceAccountPath = '/Users/sagniksen/Desktop/ASIAZE/backend/asiaze2026-firebase-adminsdk-fbsvc-61a9410fd0.json';
}

export const initFirebase = () => {
  try {
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = require(serviceAccountPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase Admin SDK initialized successfully.');
    } else {
      console.warn('Firebase Service Account Key not found. Push notifications will not work until you place serviceAccountKey.json in the backend root directory.');
    }
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
  }
};

export const getMessaging = () => {
  if (admin.apps.length === 0) {
    throw new Error('Firebase Admin SDK is not initialized.');
  }
  return admin.messaging();
};

