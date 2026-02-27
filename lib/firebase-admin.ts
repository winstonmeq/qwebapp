// import 'server-only';
// import * as admin from 'firebase-admin';
// import { getApps, cert } from 'firebase-admin/app';

// // Ensure we only initialize once
// if (!getApps().length) {
//   admin.initializeApp({
//     credential: admin.credential.cert({
//       projectId: process.env.FIREBASE_PROJECT_ID,
//       clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//       // Replace escaped newlines if your environment variable stores them as literal \n
//       privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
//     }),
//   });
// }

// export const adminApp = admin.app();
// export const adminMessaging = admin.messaging();
// // Export other services as needed: adminFirestore = admin.firestore(), etc.