import { google } from 'googleapis';

export function getDriveClient() {
  const raw = process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT;
  if (!raw) return null;
  try {
    const creds = JSON.parse(raw);
    const auth = new google.auth.GoogleAuth({
      credentials: creds,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
    return google.drive({ version: 'v3', auth });
  } catch (e) {
    console.error('[gdrive] bad GOOGLE_DRIVE_SERVICE_ACCOUNT JSON', e);
    return null;
  }
}
