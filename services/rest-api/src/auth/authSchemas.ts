import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long" })
  .refine((password) => /[a-z]/.test(password), {
    message: "Password must contain at least one lowercase letter",
  })
  .refine((password) => /[A-Z]/.test(password), {
    message: "Password must contain at least one uppercase letter",
  })
  .refine((password) => /[0-9]/.test(password), {
    message: "Password must contain at least one number",
  })
  .refine((password) => /[^a-zA-Z0-9]/.test(password), {
    message: "Password must contain at least one special character",
  });

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
export const registerUserSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  password: passwordSchema,
  profile_avatar: z.string(),
});

export const updateUserSchema = z
  .object({
    newEmail: z.string().email().optional(),
    newName: z.string().min(3).optional(),
    newPassword: passwordSchema.optional(),
    newProfile_avatar: z.string().optional(),
  })
  .partial()
  .refine((val) => Object.values(val).some((v) => v !== undefined), {
    message: "At least one field must be provided",
  });

export type LoginUser = z.infer<typeof loginUserSchema>;
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
