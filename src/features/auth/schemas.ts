import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Required email "),
  password: z.string().min(1, "Required password"),
});

export const registerSchema = z.object({
  email: z.string().trim().min(1, "Required email "),
  password: z.string().min(6, "Requerid password"),
  name: z.string().min(1, "Required name "),
});
