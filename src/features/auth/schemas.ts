import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Required email "),
  password: z.string().min(1, "Required password"),
});
