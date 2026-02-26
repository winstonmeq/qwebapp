import { GoogleAuth } from 'google-auth-library';
import FcmTokenModel from '@/models/Fcmtoken';

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID!;

async function getAccessToken(): Promise<string> {
  const auth = new GoogleAuth({
    credentials: {
      client_email: process.env.FIREBASE_CLIENT_EMAIL!,
      private_key: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
  });
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  return tokenResponse.token!;
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
}

export async function notifyByLguCode(
  lguCode: string,
  title: string,
  body: string,
  data?: Record<string, string>
) {
  const records = await FcmTokenModel.find({ lguCode }).lean();
  const tokens = records.map((r) => r.token);

  if (tokens.length === 0) {
    console.log(`No FCM tokens found for lguCode: ${lguCode}`);
    return;
  }

  const accessToken = await getAccessToken();
  const chunks = chunkArray(tokens, 500); // FCM multicast limit

  for (const chunk of chunks) {
    const res = await fetch(
      `https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            notification: { title, body },
            tokens: chunk,
            ...(data && { data }),
          },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      console.error('FCM send error:', err);
    }
  }
}