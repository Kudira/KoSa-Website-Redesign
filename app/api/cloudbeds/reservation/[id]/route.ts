import { NextResponse } from 'next/server';
import { cloudbedsFetch } from '@/lib/cloudbeds/auth';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await cloudbedsFetch('/getReservation', {
      params: { propertyID: process.env.CLOUDBEDS_PROPERTY_ID, reservationID: params.id },
    });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 404 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const data = await cloudbedsFetch('/putReservation', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyID: process.env.CLOUDBEDS_PROPERTY_ID,
        reservationID: params.id,
        ...body,
      }),
    });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await cloudbedsFetch('/putReservation', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyID: process.env.CLOUDBEDS_PROPERTY_ID,
        reservationID: params.id,
        status: 'cancelled',
      }),
    });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
