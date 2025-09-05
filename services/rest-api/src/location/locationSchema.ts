import { LocationType } from "@backend/database";
import { z } from "zod";

const searchQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 1))
    .refine((val) => Number.isInteger(val) && val > 0, {
      message: "Page must be a positive integer",
    }),
  pageSize: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 8))
    .refine((val) => Number.isInteger(val) && val > 0, {
      message: "PageSize must be a positive integer",
    }),
  sortBy: z.string().optional().default("createdAt"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
  searchTerm: z.string().optional(),
});
export default searchQuerySchema;

export const idParamsSchema = z.object({
  locationId: z.string().cuid({
    message: "ID must be a string",
  }),
});

export const createLocationSchema = z.object({
  name: z.string(),
  address: z.object({
    street: z.string(),
    city: z.string().optional(),
  }),
  type: z.nativeEnum(LocationType).optional(),
  description: z.string().optional(),
  images: z.string().array(),
  createdById: z.string().optional(),
});

export type createLocationSchema = z.infer<typeof createLocationSchema>;

export const updateLocationSchema = createLocationSchema.partial();
export type UpdateLocationSchema = z.infer<typeof updateLocationSchema>;

export type IdParamsSchema = z.infer<typeof idParamsSchema>;

export type SearchQuerySchema = z.infer<typeof searchQuerySchema>;
