import { type } from "arktype";

export const signUpResponseSchema = type({
  createdAt: 'string.date.iso',
  email: 'string.email',
  id: 'string.uuid',
  role: '"PLAYER"|"ADMIN"',
  username: '1<=string<=32',
});

export type SignUpResponse = typeof signUpResponseSchema.infer;