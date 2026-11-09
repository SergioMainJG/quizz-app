import { type IssuedSession, type MfaState, SignInService } from "@nestjs/authentication";
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "../users/entity/user.entity.js";
import { AuthController } from "./auth.controller.js";
import { CredentialsService } from "./credentials.service.js";
import { SignUpSchemaDto } from "./schema/sign-up.schema.js";

const user: User = {
  id: "5f1c6a3e-8a9b-4c2d-9e7f-1a2b3c4d5e6f",
  username: "jose",
  email: "jose@example.com",
  role: "PLAYER",
  createdAt: new Date("2026-11-04T00:00:00.000Z"),
};

const signUpBody: SignUpSchemaDto = {
  username: "jose",
  email: "jose@example.com",
  password: "correct horse battery staple",
};

const signInBody = { email: signUpBody.email, password: signUpBody.password };

const issuedSession = (mfa?: MfaState): IssuedSession => {
  const now = new Date();
  return {
    session: {
      id: "session-id",
      userId: user.id,
      createdAt: now,
      expiresAt: now,
      lastActiveAt: now,
      mfa,
    },
    token: "token",
    cookie: "__Host-sid=token",
  };
};

const createCredentialsMock = () => ({
  register: vi.fn<CredentialsService["register"]>(),
  verify: vi.fn<CredentialsService["verify"]>(),
});

const createSignInMock = () => ({
  signIn: vi.fn<SignInService["signIn"]>(),
});

describe("AuthController", () => {
  let controller: AuthController;
  let credentialsService: ReturnType<typeof createCredentialsMock>;
  let signInService: ReturnType<typeof createSignInMock>;

  beforeEach(async () => {
    credentialsService = createCredentialsMock();
    signInService = createSignInMock();
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: CredentialsService, useValue: credentialsService },
        { provide: SignInService, useValue: signInService },
      ],
    }).compile();
    controller = moduleRef.get(AuthController);
  });

  describe("signUp", () => {
    it("registers the user, signs them in with the password method and returns them", async () => {
      credentialsService.register.mockResolvedValue(user);
      signInService.signIn.mockResolvedValue(issuedSession());

      await expect(controller.signUp(signUpBody)).resolves.toEqual(user);
      expect(credentialsService.register).toHaveBeenCalledWith(signUpBody);
      expect(signInService.signIn).toHaveBeenCalledWith(user.id, { method: "password" });
    });

    it("never returns the password hash, even if the service includes it", async () => {
      credentialsService.register.mockResolvedValue({ ...user, password: "$scrypt$hash" } as User);
      signInService.signIn.mockResolvedValue(issuedSession());

      const response = await controller.signUp(signUpBody);

      expect(response).toEqual(user);
      expect(response).not.toHaveProperty("password");
    });

    it("passes only username, email and password to the service", async () => {
      credentialsService.register.mockResolvedValue(user);
      signInService.signIn.mockResolvedValue(issuedSession());

      await controller.signUp({ ...signUpBody, role: "ADMIN" } as SignUpSchemaDto);

      expect(credentialsService.register).toHaveBeenCalledWith(signUpBody);
    });

    it("does not sign in when registration fails", async () => {
      credentialsService.register.mockRejectedValue(
        new ConflictException("Email already registered"),
      );

      await expect(controller.signUp(signUpBody)).rejects.toThrow(ConflictException);
      expect(signInService.signIn).not.toHaveBeenCalled();
    });
  });

  describe("signIn", () => {
    it("throws UnauthorizedException when the credentials are wrong", async () => {
      credentialsService.verify.mockResolvedValue(null);

      await expect(controller.signIn(signInBody)).rejects.toThrow(UnauthorizedException);
      expect(signInService.signIn).not.toHaveBeenCalled();
    });

    it("signs the user in and reports that no second factor is needed", async () => {
      credentialsService.verify.mockResolvedValue(user);
      signInService.signIn.mockResolvedValue(issuedSession());

      await expect(controller.signIn(signInBody)).resolves.toEqual({ mfaRequired: false });
      expect(credentialsService.verify).toHaveBeenCalledWith(signInBody);
      expect(signInService.signIn).toHaveBeenCalledWith(user.id, { method: "password" });
    });

    it("reports mfaRequired when the session is waiting for a second factor", async () => {
      credentialsService.verify.mockResolvedValue(user);
      signInService.signIn.mockResolvedValue(issuedSession("pending"));

      await expect(controller.signIn(signInBody)).resolves.toEqual({ mfaRequired: true });
    });
  });
});
