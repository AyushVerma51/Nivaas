import { AppError } from "../../lib/errors";
import { prisma } from "./prisma";

/**
 * Resolve a destination reference that may be a DB id OR a public slug
 * (the frontend sends slugs like "varanasi"). Returns the DB id.
 */
export async function resolveDestinationId(input: string): Promise<string> {
  const dest = await prisma.destination.findFirst({
    where: { OR: [{ id: input }, { slug: input }] },
    select: { id: true },
  });
  if (!dest) throw new AppError(404, "DESTINATION_NOT_FOUND", "The requested destination could not be found");
  return dest.id;
}
