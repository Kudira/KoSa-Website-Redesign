import { NextResponse } from 'next/server';
import { cloudbedsFetch } from '@/lib/cloudbeds/auth';

export const revalidate = 600;

export async function GET() {
  try {
    const data = await cloudbedsFetch('/getRatePlans', {
      params: { propertyID: process.env.CLOUDBEDS_PROPERTY_ID },
    });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ configured: false, error: (e as Error).message, data: [] });
  }
}
