import * as admin from 'firebase-admin';
import FcmTokenModel from '@/models/Fcmtoken';

// Ensure this is initialized in your singleton/app setup
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function notifyByLguCode(
  lguCode: string,
  title: string,
  body: string,
  data?: Record<string, string>
) {
  // 1. Fetch only the tokens
  const records = await FcmTokenModel.find({ lguCode }).select('token').lean();
  const tokens = records.map((r) => r.token).filter(Boolean) as string[];

  if (tokens.length === 0) return;

  // 2. Prepare the message
const message: admin.messaging.MulticastMessage = {
  notification: { title, body },
  data: data || {},
  tokens: tokens,
  android: {
    notification: {
      channelId: 'qalert_emergency_channel',
      sound: 'default',
      // Explicitly cast or use the literal value to satisfy TypeScript
      priority: 'high' as const, 
    },
  },
  apns: {
    payload: {
      aps: {
        sound: 'default',
        badge: 1,
      },
    },
  },
};

try {
  const response = await admin.messaging().sendEachForMulticast(message);
  
  if (response.failureCount > 0) {
    console.error(`Failed to send ${response.failureCount} messages.`);
    
    // Inspect specific failures
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        const error = resp.error;
        console.error(`Token at index ${idx} failed:`, error?.code);
        
        // If the token is no longer valid, delete it from MongoDB
        if (error?.code === 'messaging/registration-token-not-registered' || 
            error?.code === 'messaging/invalid-registration-token') {
          const failedToken = tokens[idx];
          FcmTokenModel.deleteOne({ token: failedToken }).catch(console.error);
        }
      }
    });
  }
} catch (error) {
  console.error('FCM Admin SDK Error:', error);
}
}