// Generic CRUD helpers. Each resource gets a small adapter that maps schema
// fields → Prisma data fields and (optionally) computes a slug. The helper
// then returns ready-to-export Next.js route handlers.

import { NextResponse, type NextRequest } from 'next/server';
import type { ZodTypeAny, z } from 'zod';
import { requireRole, type AdminRole } from '@/lib/admin/auth';
import {
  badRequest,
  conflict,
  noContent,
  notFound,
  ok,
  serverError,
  zodError,
} from '@/lib/admin/response';

type SearchBuilder = (q: string) => Record<string, unknown>;

export interface CrudConfig<Schema extends ZodTypeAny, Row> {
  schema: Schema;
  /** Prisma delegate for the model. Pass `prisma.room` etc. */
  delegate: {
    findMany: (args: unknown) => Promise<Row[]>;
    findUnique: (args: unknown) => Promise<Row | null>;
    create: (args: unknown) => Promise<Row>;
    update: (args: unknown) => Promise<Row>;
    delete: (args: unknown) => Promise<Row>;
  };
  /** Map validated input → Prisma data object for `create`. */
  toCreate: (input: z.infer<Schema>) => Promise<Record<string, unknown>> | Record<string, unknown>;
  /** Map validated input → Prisma data object for `update` (merged with existing). */
  toUpdate: (
    input: Partial<z.infer<Schema>>,
    existing: Row,
  ) => Promise<Record<string, unknown>> | Record<string, unknown>;
  /** Optional searchable fields for ?q=foo. */
  search?: SearchBuilder;
  /** Default order; pass an array of Prisma orderBy clauses. */
  orderBy?: unknown;
  /** Roles allowed to read. Defaults: OWNER+EDITOR+SUPPORT. */
  readRoles?: AdminRole[];
  /** Roles allowed to write. Defaults: OWNER+EDITOR. */
  writeRoles?: AdminRole[];
  /** Response key (e.g. 'rooms', 'treatments'). */
  collectionKey: string;
  itemKey: string;
}

export function makeCollectionRoute<Schema extends ZodTypeAny, Row>(cfg: CrudConfig<Schema, Row>) {
  const readRoles = cfg.readRoles ?? ['OWNER', 'EDITOR', 'SUPPORT'];
  const writeRoles = cfg.writeRoles ?? ['OWNER', 'EDITOR'];

  async function GET(req: NextRequest) {
    const guard = await requireRole(readRoles);
    if (guard instanceof NextResponse) return guard;

    const url = new URL(req.url);
    const q = url.searchParams.get('q')?.trim().toLowerCase();

    try {
      const rows = await cfg.delegate.findMany({
        where: q && cfg.search ? cfg.search(q) : undefined,
        orderBy: cfg.orderBy,
      });
      return ok({ [cfg.collectionKey]: rows });
    } catch (e) {
      return serverError((e as Error).message);
    }
  }

  async function POST(req: NextRequest) {
    const guard = await requireRole(writeRoles);
    if (guard instanceof NextResponse) return guard;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return badRequest('Invalid JSON body');
    }

    const parsed = cfg.schema.safeParse(body);
    if (!parsed.success) return zodError(parsed.error);

    try {
      const data = await cfg.toCreate(parsed.data);
      const row = await cfg.delegate.create({ data });
      return ok({ [cfg.itemKey]: row }, 201);
    } catch (e) {
      const err = e as { code?: string; message: string };
      if (err.code === 'P2002') return conflict('A record with that unique value already exists');
      return serverError(err.message);
    }
  }

  return { GET, POST };
}

interface Ctx {
  params: { id: string };
}

export function makeItemRoute<Schema extends ZodTypeAny, Row>(cfg: CrudConfig<Schema, Row>) {
  const readRoles = cfg.readRoles ?? ['OWNER', 'EDITOR', 'SUPPORT'];
  const writeRoles = cfg.writeRoles ?? ['OWNER', 'EDITOR'];

  async function GET(_req: NextRequest, { params }: Ctx) {
    const guard = await requireRole(readRoles);
    if (guard instanceof NextResponse) return guard;
    const row = await cfg.delegate.findUnique({ where: { id: params.id } });
    if (!row) return notFound();
    return ok({ [cfg.itemKey]: row });
  }

  async function PATCH(req: NextRequest, { params }: Ctx) {
    const guard = await requireRole(writeRoles);
    if (guard instanceof NextResponse) return guard;

    const existing = await cfg.delegate.findUnique({ where: { id: params.id } });
    if (!existing) return notFound();

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return badRequest('Invalid JSON body');
    }

    const parsed = (cfg.schema as unknown as { partial: () => ZodTypeAny }).partial().safeParse(body);
    if (!parsed.success) return zodError(parsed.error);

    try {
      const data = await cfg.toUpdate(parsed.data as Partial<z.infer<Schema>>, existing);
      const row = await cfg.delegate.update({ where: { id: params.id }, data });
      return ok({ [cfg.itemKey]: row });
    } catch (e) {
      const err = e as { code?: string; message: string };
      if (err.code === 'P2002') return conflict('A record with that unique value already exists');
      return serverError(err.message);
    }
  }

  async function DELETE(_req: NextRequest, { params }: Ctx) {
    const guard = await requireRole(writeRoles);
    if (guard instanceof NextResponse) return guard;
    try {
      await cfg.delegate.delete({ where: { id: params.id } });
      return noContent();
    } catch (e) {
      const err = e as { code?: string; message: string };
      if (err.code === 'P2025') return notFound();
      return serverError(err.message);
    }
  }

  return { GET, PATCH, DELETE };
}
