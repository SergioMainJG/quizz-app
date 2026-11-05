import { PasswordHasher } from "@nestjs/authentication";
import { ConflictException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "../users/entity/user.entity.js";
import { UsersRepository } from "../users/users.repository.js";
import { CredentialsService } from "./credentials.service.js";

const user: User = {
  id: "5f1c6a3e-8a9b-4c2d-9e7f-1a2b3c4d5e6f",
  username: "jose",
  email: "jose@example.com",
  role: "PLAYER",
  createdAt: new Date("2026-11-04T00:00:00.000Z"),
};

const password = "correct horse battery staple";

const passwordHasher = new PasswordHasher({ logN: 11 });
const legacyHasher = new PasswordHasher({ logN: 10 });

const createRepositoryMock = () => ({
  findByEmail: vi.fn<UsersRepository["findByEmail"]>(),
  create: vi.fn<UsersRepository["create"]>(),
  updatePasswordHash: vi.fn<UsersRepository["updatePasswordHash"]>(),
});

describe("CredentialsService", () => {
  let service: CredentialsService;
  let usersRepository: ReturnType<typeof createRepositoryMock>;

  beforeEach(async () => {
    usersRepository = createRepositoryMock();
    const moduleRef = await Test.createTestingModule({
      providers: [
        CredentialsService,
        { provide: UsersRepository, useValue: usersRepository },
        { provide: PasswordHasher, useValue: passwordHasher },
      ],
    }).compile();
    service = moduleRef.get(CredentialsService);
  });

  describe("register", () => {
    const body = { username: "jose", email: "jose@example.com", password };

    it("throws ConflictException when the email is already registered", async () => {
      usersRepository.findByEmail.mockResolvedValue({ ...user, password: "stored-hash" });

      await expect(service.register(body)).rejects.toThrow(ConflictException);
      expect(usersRepository.create).not.toHaveBeenCalled();
    });

    it("stores a hash of the password, never the plaintext", async () => {
      usersRepository.findByEmail.mockResolvedValue(null);
      usersRepository.create.mockImplementation(async (newUser) => ({ ...user, ...newUser }));

      await service.register(body);

      const stored = usersRepository.create.mock.calls[0]![0];
      expect(stored).toMatchObject({ username: "jose", email: "jose@example.com" });
      expect(stored.password).not.toBe(password);
      await expect(passwordHasher.verify(password, stored.password)).resolves.toBe(true);
    });

    it("returns what the repository created", async () => {
      const created = { ...user, password: "stored-hash" };
      usersRepository.findByEmail.mockResolvedValue(null);
      usersRepository.create.mockResolvedValue(created);

      await expect(service.register(body)).resolves.toEqual(created);
    });
  });

  describe("verify", () => {
    let storedHash: string;

    beforeAll(async () => {
      storedHash = await passwordHasher.hash(password);
    });

    it("returns null when no user has that email", async () => {
      usersRepository.findByEmail.mockResolvedValue(null);

      await expect(service.verify({ email: "nobody@example.com", password })).resolves.toBeNull();
    });

    it("returns null when the password is wrong", async () => {
      usersRepository.findByEmail.mockResolvedValue({ ...user, password: storedHash });

      await expect(service.verify({ email: user.email, password: "wrong password" })).resolves.toBeNull();
      expect(usersRepository.updatePasswordHash).not.toHaveBeenCalled();
    });

    it("returns the user when the password is right", async () => {
      usersRepository.findByEmail.mockResolvedValue({ ...user, password: storedHash });

      await expect(service.verify({ email: user.email, password })).resolves.toMatchObject(user);
      expect(usersRepository.updatePasswordHash).not.toHaveBeenCalled();
    });

    it("rehashes the password when the stored hash uses older parameters", async () => {
      const legacyHash = await legacyHasher.hash(password);
      usersRepository.findByEmail.mockResolvedValue({ ...user, password: legacyHash });

      await expect(service.verify({ email: user.email, password })).resolves.toMatchObject(user);

      expect(usersRepository.updatePasswordHash).toHaveBeenCalledOnce();
      const [userId, newHash] = usersRepository.updatePasswordHash.mock.calls[0]!;
      expect(userId).toBe(user.id);
      expect(passwordHasher.needsRehash(newHash)).toBe(false);
      await expect(passwordHasher.verify(password, newHash)).resolves.toBe(true);
    });
  });
});
