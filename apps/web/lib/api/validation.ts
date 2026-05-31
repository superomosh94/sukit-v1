import { type ZodSchema, type ZodError } from "zod";
import { ValidationError } from "./errors";

export function validate<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = formatZodErrors(result.error);
    throw new ValidationError(errors.join("; "));
  }
  return result.data;
}

export function formatZodErrors(error: ZodError): string[] {
  return error.errors.map((e) => {
    const path = e.path.join(".");
    return path ? `${path}: ${e.message}` : e.message;
  });
}

export function validateOrNull<T>(
  schema: ZodSchema<T>,
  data: unknown,
): T | null {
  const result = schema.safeParse(data);
  if (!result.success) return null;
  return result.data;
}

export async function validateRequest<T>(
  schema: ZodSchema<T>,
  request: Request,
): Promise<T> {
  const body = await request.json();
  return validate(schema, body);
}
