import admin from 'firebase-admin';

let app: admin.app.App | null = null;
let initialized = false;

function getFirebaseApp(): admin.app.App | null {
  if (initialized) return app;
  initialized = true;

  const projectId   = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey  = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    console.warn('Firebase credentials missing — push notifications disabled');
    return null;
  }

  try {
    // Check if already initialized
    app = admin.apps.length
      ? admin.apps[0]!
      : admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
    console.log('Firebase initialized successfully');
  } catch (err) {
    console.error('Firebase init error:', err);
    app = null;
  }

  return app;
}

export async function sendPushNotification(opts: {
  tokens:  string[];
  title:   string;
  body:    string;
  data?:   Record<string, string>;
}): Promise<void> {
  console.log('sendPushNotification — tokens:', opts.tokens.length);

  if (!opts.tokens.length) return;

  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) {
    console.warn('Firebase not available — skipping push notification');
    return;
  }

  const messaging = firebaseApp.messaging();
  const chunks: string[][] = [];

  for (let i = 0; i < opts.tokens.length; i += 500) {
    chunks.push(opts.tokens.slice(i, i + 500));
  }

  for (const chunk of chunks) {
    try {
      const result = await messaging.sendEachForMulticast({
        tokens:       chunk,
        notification: { title: opts.title, body: opts.body },
        data:         opts.data ?? {},
        webpush: {
          notification: {
            title: opts.title,
            body:  opts.body,
            icon:  '/icon-192x192.png',
            badge: '/icon-192x192.png',
            data:  opts.data ?? {},
          },
          fcmOptions: { link: opts.data?.url ?? '/' },
        },
      });
      console.log('Push sent — success:', result.successCount, 'failed:', result.failureCount);
      result.responses.forEach((r, i) => {
        if (!r.success) console.error('Token', i, 'error:', r.error?.message);
      });
    } catch (err) {
      console.error('Push error:', err);
    }
  }
}