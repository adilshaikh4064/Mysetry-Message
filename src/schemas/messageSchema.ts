import { z } from "zod";

export const messageSchema = z.object({
    content: z
        .string()
        .min(10, "content must have 10 characters.")
        .max(300, "content must not have more than 300 characters."),
});
