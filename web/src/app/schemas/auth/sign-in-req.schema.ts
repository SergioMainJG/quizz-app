import { type } from "arktype";

export const signInRequestSchema = type({
    email: 'string.email',
    password: '12<=string <= 128',
});

export type SignInRequest = typeof signInRequestSchema.infer;


