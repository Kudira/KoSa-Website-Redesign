import { NextResponse } from 'next/server';
import { cloudbedsFetch } from '@/lib/cloudbeds/auth';

export const revalidate = 120;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const startDate = url.searchParams.get('startDate');
  const endDate = url.searchParams.get('endDate');
  const adults = url.searchParams.get('adults') || '2';
  const children = url.searchParams.get('children') || '0';
  if (!startDate || !endDate) {
    return NextResponse.json({ error: 'startDate and endDate required' }, { status: 400 });
  }
  try {
    const data = await cloudbedsFetch('/getAvailableRoomTypes', {
      params: {
        propertyID: process.env.CLOUDBEDS_PROPERTY_ID,
        startDate,
        endDate,
        adults,
        children,
      },
    });
    return NextResponse.json(data);
  } catch (e) {
    // Graceful fallback so the UI doesn't break in environments without Cloudbeds wired
    return NextResponse.json(
      { configured: false, error: (e as Error).message, available: [] },
      { status: 200 },
    );
  }
}
