// Tiny helpers for consistent JSON responses across admin API routes.

import { NextResponse } from 'next/server';
import type { ZodError } from 'zod';

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function created<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function badRequest(message: string, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status: 400 });
}

export function notFound(message = 'Not found') {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function conflict(message: string) {
  return NextResponse.json({ error: message }, { status: 409 });
}

export function serverError(message = 'Internal server error', details?: unknown) {
  return NextResponse.json({ error: message, details }, { status: 500 });
}

/** Flatten a zod error into a friendly 400 payload. */
export function zodError(error: ZodError) {
  return NextResponse.json(
    {
      error: 'Validation failed',
      details: error.flatten(),
    },
    { status: 400 },
  );
}
