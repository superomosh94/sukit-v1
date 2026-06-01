import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export type ApiError = {
  error: string;
  code?: string;
  details?: unknown;
};

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function created<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function badRequest(message: string, details?: unknown) {
  return NextResponse.json(
    { error: message, code: 'BAD_REQUEST', details },
    { status: 400 }
  );
}

export function unauthorized(message = 'Authentication required') {
  return NextResponse.json(
    { error: message, code: 'UNAUTHORIZED' },
    { status: 401 }
  );
}

export function forbidden(message = 'Access denied') {
  return NextResponse.json(
    { error: message, code: 'FORBIDDEN' },
    { status: 403 }
  );
}

export function notFound(resource = 'Resource') {
  return NextResponse.json(
    { error: `${resource} not found`, code: 'NOT_FOUND' },
    { status: 404 }
  );
}

export function conflict(message: string) {
  return NextResponse.json(
    { error: message, code: 'CONFLICT' },
    { status: 409 }
  );
}

export function tooManyRequests(retryAfter = 60) {
  return NextResponse.json(
    { error: 'Too many requests', code: 'RATE_LIMITED' },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } }
  );
}

export function serverError(message = 'Internal server error') {
  return NextResponse.json(
    { error: message, code: 'INTERNAL' },
    { status: 500 }
  );
}

export async function handleApi<T>(
  fn: () => Promise<T>
): Promise<NextResponse> {
  try {
    const data = await fn();
    return ok(data);
  } catch (err: any) {
    if (err instanceof ZodError) {
      return badRequest('Validation failed', err.flatten());
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        return conflict('Resource already exists');
      }
      if (err.code === 'P2025') {
        return notFound();
      }
    }
    if (err?.name === 'UnauthorizedError') return unauthorized(err.message);
    if (err?.name === 'ForbiddenError') return forbidden(err.message);
    if (err?.status) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: err.status }
      );
    }
    console.error('[marketplace API]', err);
    return serverError(err?.message || 'Internal server error');
  }
}

export function parseIntParam(
  value: string | null | undefined,
  def: number,
  opts: { min?: number; max?: number } = {}
): number {
  if (value === null || value === undefined) return def;
  const n = parseInt(String(value), 10);
  if (isNaN(n)) return def;
  const min = opts.min ?? -Infinity;
  const max = opts.max ?? Infinity;
  return Math.min(max, Math.max(min, n));
}

export function parseFloatParam(
  value: string | null | undefined,
  def: number
): number {
  if (value === null || value === undefined) return def;
  const n = parseFloat(String(value));
  return isNaN(n) ? def : n;
}

export function parseStringParam(
  value: string | null | undefined,
  def: string = ''
): string {
  return value ?? def;
}

export function parseBoolParam(
  value: string | null | undefined
): boolean | undefined {
  if (value === null || value === undefined) return undefined;
  return value === 'true' || value === '1' || value === 'yes';
}
