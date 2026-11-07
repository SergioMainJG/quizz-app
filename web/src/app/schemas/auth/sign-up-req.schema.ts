import { type } from 'arktype';

export const signUpRequestSchema = type({
  username: '1 <= string <= 32',
  email: 'string.email',
  password: '12 <= string <= 128',
});

export type SignUpRequest = typeof signUpRequestSchema.infer;