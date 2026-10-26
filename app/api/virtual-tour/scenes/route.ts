import { NextResponse } from 'next/server';
import { getDriveClient } from '@/lib/google-drive/client';
import { listPublicTourScenes } from '@/lib/cms/virtualTour';

export const dynamic = 'force-dynamic';

// No stock photos: until real 360° scenes are added in Admin > Virtual Tour, the page shows its empty state.
const FALLBACK_SCENES: { sceneId: string; sceneName: string; imageUrl: string; thumbnailUrl: string }[] = [];

export async function GET() {
  // 1. Prefer scenes curated in the admin CMS.
  const fromDb = await listPublicTourScenes();
  if (fromDb.length) {
    return NextResponse.json({ scenes: fromDb, source: 'cms' });
  }

  // 2. Fall back to Google Drive (legacy integration).
  const drive = getDriveClient();
  const folderId = process.env.GOOGLE_DRIVE_VIRTUAL_TOUR_FOLDER;
  if (drive && folderId) {
    try {
      const list = await drive.files.list({
        q: `'${folderId}' in parents and (mimeType contains 'image/' or mimeType = 'application/vnd.google-apps.folder')`,
        fields: 'files(id,name,mimeType,thumbnailLink,webContentLink)',
        pageSize: 100,
      });
      const files = list.data.files ?? [];
      const scenes = files
        .filter((f) => f.mimeType?.startsWith('image/'))
        .map((f) => ({
          sceneId: f.id!,
          sceneName: f.name?.replace(/\.[^.]+$/, '') ?? 'Scene',
          imageUrl: `https://drive.google.com/uc?id=${f.id}`,
          thumbnailUrl: f.thumbnailLink ?? `https://drive.google.com/uc?id=${f.id}`,
        }));
      if (scenes.length) {
        return NextResponse.json({ scenes, source: 'drive' });
      }
    } catch (e) {
      return NextResponse.json({
        scenes: FALLBACK_SCENES,
        source: 'fallback',
        error: (e as Error).message,
      });
    }
  }

  // 3. Static fallback.
  return NextResponse.json({ scenes: FALLBACK_SCENES, source: 'fallback' });
}
