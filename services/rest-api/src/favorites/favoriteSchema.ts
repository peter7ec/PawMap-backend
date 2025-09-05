import { z } from "zod";

export const favoriteQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().min(1).max(100).default(10),
  locationId: z.string().cuid().optional(),
  userId: z.string().cuid().optional(),
});

export type FavoriteQuery = z.infer<typeof favoriteQuerySchema>;

export const favoriteIdSchema = z.object({
  locationId: z.string().cuid(),
});

export const favoriteCreateSchema = z.object({
  locationId: z.string().cuid(),
});
