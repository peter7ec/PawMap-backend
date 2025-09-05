import z from "zod";

export const idParamsSchema = z.object({
  eventId: z.string().cuid({
    message: "ID must be a string",
  }),
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
    .transform((val) => (val ? Number(val) : 5))
    .refine((val) => Number.isInteger(val) && val > 0, {
      message: "PageSize must be a positive integer",
    }),
  sortBy: z.string().optional().default("createdAt"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
  searchTerm: z.string().optional(),
});

export const createEvenetSchema = z.object({
  locationId: z.string().optional().nullable(),
  address: z.string().min(10, "Address is required"),
  title: z
    .string()
    .min(5, "Title is required and must be at least 5 characters."),
  description: z
    .string()
    .min(20, "Description is required and must be at least 20 characters."),
  startsAt: z.string().refine((date) => !Number.isNaN(Date.parse(date)), {
    message: "startsAt is required and  must be a valid date",
  }),
  endsAt: z
    .string()
    .refine((date) => !Number.isNaN(Date.parse(date)), {
      message: "endsAt is required and must be a valid date ",
    })
    .optional()
    .nullable(),
  intrested: z.boolean().optional().default(false),
  willBeThere: z.boolean().optional().default(false),
});

export const updateEvent = createEvenetSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided to update the Event",
  });

export const validatedPartipationStatus = z
  .object({
    willBeThere: z.boolean().optional(),
    interested: z.boolean().optional(),
  })
  .refine(
    (data) => data.willBeThere !== undefined || data.interested !== undefined,
    {
      message: "At least one of 'willBeThere' or 'interested' must be provided",
    }
  );

export default searchQuerySchema;

export type SearchQuerySchema = z.infer<typeof searchQuerySchema>;
export type IdParamsSchema = z.infer<typeof idParamsSchema>;
export type CreateEvenetSchema = z.infer<typeof createEvenetSchema>;
export type UpdateEventSchema = z.infer<typeof updateEvent>;
export type ValidatedPartipationStatus = z.infer<
  typeof validatedPartipationStatus
>;
