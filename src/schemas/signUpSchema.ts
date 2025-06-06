import { z } from "zod";

export const userNameValidation = z
    .string()
    .min(3, "username must have atleast 3 characters.")
    .max(20, "username must not have more than 20 characters.")
    .regex(/^[a-z][a-z0-9._]{2,19}$/, "invalid username format.");

export const signUpSchema = z.object({
    username: userNameValidation,
    email: z.string().email({ message: "invalid email format" }),
    password: z
        .string()
        .min(6, { message: "password must be atleast 6 characters" }),
});
