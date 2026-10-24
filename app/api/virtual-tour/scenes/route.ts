import { NextResponse } from 'next/server';
import { getDriveClient } from '@/lib/google-drive/client';
import { listPublicTourScenes } from '@/lib/cms/virtualTour';

export const dynamic = 'force-dynamic';

const FALLBACK_SCENES = [
  {
    sceneId: 'beach',
    sceneName: 'Beach',
    imageUrl:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=4000',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=400',
  },
  {
    sceneId: 'palm-garden',
    sceneName: 'Palm Garden',
    imageUrl:
      'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?auto=format&fit=crop&q=80&w=4000',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?auto=format&fit=crop&q=80&w=400',
  },
  {
    sceneId: 'signature-suite',
    sceneName: 'Signature Suite',
    imageUrl:
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=4000',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=400',
  },
  {
    sceneId: 'pool',
    sceneName: 'Infinity Pool',
    imageUrl:
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=4000',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=400',
  },
  {
    sceneId: 'spa',
    sceneName: 'Spa',
    imageUrl:
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=4000',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=400',
  },
  {
    sceneId: 'dining',
    sceneName: 'Dining Terrace',
    imageUrl:
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=4000',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=400',
  },
];

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
