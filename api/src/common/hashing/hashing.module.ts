import { Global, Module } from "@nestjs/common";

import { BunPasswordHasher } from "./bun-password-hasher.js";
import { PasswordHasher } from "./password-hasher.js";

@Global()
@Module({
  exports: [PasswordHasher],
  providers: [{ provide: PasswordHasher, useClass: BunPasswordHasher }],
})
export class HashingModule {}
