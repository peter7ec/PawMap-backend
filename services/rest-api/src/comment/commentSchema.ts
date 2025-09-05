import { z } from "zod";

export const idParamsSchema = z.object({
  commentId: z.string().cuid({
    message: "ID must be a string",
  }),
});

export const createCommentIdSchema = z.object({
  userId: z.string().cuid({ message: "ID must be a string" }),
});

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(10, { message: "Contet must be at least 10 characters long" }),
  parentId: z.string().cuid().optional(),
  eventId: z.string().cuid().optional(),
  locationId: z.string().cuid().optional(),
});

export const UpdateComment = createCommentSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided to update the comment",
  });

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
  locationId: z.string().cuid().optional(),
  eventId: z.string().cuid().optional(),
});
export default searchQuerySchema;

export type IdParamsSchema = z.infer<typeof idParamsSchema>;
export type CreateCommentIdSchema = z.infer<typeof createCommentIdSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentSchema = z.infer<typeof UpdateComment>;
export type SearchQuerySchema = z.infer<typeof searchQuerySchema>;
