import { AuthenticationModule } from "@nestjs/authentication";
import { Test } from "@nestjs/testing";
import { describe, expect, it } from "vitest";
import { UsersRepository } from "../users/users.repository.js";
import { AuthController } from "./auth.controller.js";
import { AuthModule } from "./auth.module.js";
import { CredentialsService } from "./credentials.service.js";
import { SessionAuth } from "./session-auth.provider.js";

describe("AuthModule", () => {
  it("resolves its controller and providers", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        AuthenticationModule.forRoot({ session: { absoluteTtl: "14d", idleTtl: "3d" } }),
        AuthModule,
      ],
    })
      .overrideProvider(UsersRepository)
      .useValue({})
      .compile();

    expect(moduleRef.get(AuthController)).toBeInstanceOf(AuthController);
    expect(moduleRef.get(CredentialsService)).toBeInstanceOf(CredentialsService);
    expect(moduleRef.get(SessionAuth)).toBeInstanceOf(SessionAuth);

    await moduleRef.close();
  });
});
