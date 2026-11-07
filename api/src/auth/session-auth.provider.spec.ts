import { AuthenticationRegistry, type SessionRecord, SessionService } from "@nestjs/authentication";
import { Test } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "../users/entity/user.entity.js";
import { UsersRepository } from "../users/users.repository.js";
import { SessionAuth } from "./session-auth.provider.js";

const user: User = {
  id: "5f1c6a3e-8a9b-4c2d-9e7f-1a2b3c4d5e6f",
  username: "jose",
  email: "jose@example.com",
  role: "PLAYER",
  createdAt: new Date("2026-11-04T00:00:00.000Z"),
};

const sessionFor = (userId: string): SessionRecord => {
  const now = new Date();
  return { id: "session-id", userId, createdAt: now, expiresAt: now, lastActiveAt: now };
};

describe("SessionAuth", () => {
  let provider: SessionAuth;
  let usersRepository: { findById: ReturnType<typeof vi.fn<UsersRepository["findById"]>> };
  let registry: {
    registerProvider: ReturnType<typeof vi.fn<AuthenticationRegistry["registerProvider"]>>;
  };

  beforeEach(async () => {
    usersRepository = { findById: vi.fn<UsersRepository["findById"]>() };
    registry = { registerProvider: vi.fn<AuthenticationRegistry["registerProvider"]>() };
    const moduleRef = await Test.createTestingModule({
      providers: [
        SessionAuth,
        { provide: UsersRepository, useValue: usersRepository },
        { provide: AuthenticationRegistry, useValue: registry },
        { provide: SessionService, useValue: {} },
      ],
    }).compile();
    provider = moduleRef.get(SessionAuth);
  });

  it("registers itself in the authentication registry", () => {
    expect(registry.registerProvider).toHaveBeenCalledOnce();
    expect(registry.registerProvider).toHaveBeenCalledWith(provider);
  });

  it("loads the user that owns the session", async () => {
    usersRepository.findById.mockResolvedValue(user);

    await expect(provider.validate(sessionFor(user.id))).resolves.toEqual(user);
    expect(usersRepository.findById).toHaveBeenCalledWith(user.id);
  });

  it("returns null for a deleted user, which ends the session", async () => {
    usersRepository.findById.mockResolvedValue(null);

    await expect(provider.validate(sessionFor(user.id))).resolves.toBeNull();
  });
});
