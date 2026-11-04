import { Injectable } from "@nestjs/common";

import { PasswordHasher } from "./password-hasher.js";

/** Uses Bun's native `Bun.password` (no extra dependency). */
@Injectable()
export class BunPasswordHasher extends PasswordHasher {
  hash(password: string): Promise<string> {
    return Bun.password.hash(password, { algorithm: "argon2id" });
  }

  verify(password: string, passwordHash: string): Promise<boolean> {
    return Bun.password.verify(password, passwordHash);
  }
}
