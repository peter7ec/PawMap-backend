import { z } from "zod";

export const reviewSchema = z.object({
  comment: z.string().min(1, "Comment is required"),
  rating: z.number().min(1).max(5, "Rating must be between 1 and 5"),
  locationId: z.string(),
});

export const reviewIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const reviewQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => val > 0, { message: "Page must be positive" }),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .refine((val) => val > 0, { message: "Limit must be positive" }),
  locationId: z.string().optional(),
  userId: z.string().optional(),
});

export type ReviewQuery = z.infer<typeof reviewQuerySchema>;
