import { ConflictException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UsersInsertSchema } from "../config/drizzle/schemas/users.schema.js";
import type { User } from "./entity/user.entity.js";
import { UsersRepository } from "./users.repository.js";
import { UsersService } from "./users.service.js";

const user: User = {
  id: "5f1c6a3e-8a9b-4c2d-9e7f-1a2b3c4d5e6f",
  username: "jose",
  email: "jose@example.com",
  role: "PLAYER",
  createdAt: new Date("2026-11-04T00:00:00.000Z"),
};

const userWithPassword = { ...user, password: "hashed" };

const newUser: UsersInsertSchema = {
  username: "jose",
  email: "jose@example.com",
  password: "hashed",
  role: "PLAYER",
};

const createRepositoryMock = () => ({
  create: vi.fn<UsersRepository["create"]>(),
  findById: vi.fn<UsersRepository["findById"]>(),
  findByEmail: vi.fn<UsersRepository["findByEmail"]>(),
  findByUsername: vi.fn<UsersRepository["findByUsername"]>(),
});

describe("UsersService", () => {
  let service: UsersService;
  let usersRepository: ReturnType<typeof createRepositoryMock>;

  beforeEach(async () => {
    usersRepository = createRepositoryMock();
    const moduleRef = await Test.createTestingModule({
      providers: [UsersService, { provide: UsersRepository, useValue: usersRepository }],
    }).compile();
    service = moduleRef.get(UsersService);
  });

  describe("create", () => {
    it("delegates to the repository and returns the created user", async () => {
      usersRepository.create.mockResolvedValue(userWithPassword);

      await expect(service.create(newUser)).resolves.toEqual(userWithPassword);
      expect(usersRepository.create).toHaveBeenCalledOnce();
      expect(usersRepository.create).toHaveBeenCalledWith(newUser);
    });

    it("propagates the repository's ConflictException", async () => {
      usersRepository.create.mockRejectedValue(new ConflictException("username already used"));

      await expect(service.create(newUser)).rejects.toThrow(ConflictException);
    });
  });

  describe("findOneById", () => {
    it("returns the user from the repository", async () => {
      usersRepository.findById.mockResolvedValue(user);

      await expect(service.findOneById(user.id)).resolves.toEqual(user);
      expect(usersRepository.findById).toHaveBeenCalledWith(user.id);
    });

    it("returns null when the user does not exist", async () => {
      usersRepository.findById.mockResolvedValue(null);

      await expect(service.findOneById(user.id)).resolves.toBeNull();
    });
  });

  describe("findOneByEmail", () => {
    it("returns the user from the repository", async () => {
      usersRepository.findByEmail.mockResolvedValue(userWithPassword);

      await expect(service.findOneByEmail(user.email)).resolves.toEqual(userWithPassword);
      expect(usersRepository.findByEmail).toHaveBeenCalledWith(user.email);
    });

    it("returns null when the user does not exist", async () => {
      usersRepository.findByEmail.mockResolvedValue(null);

      await expect(service.findOneByEmail("nobody@example.com")).resolves.toBeNull();
    });
  });

  describe("findOneByUsername", () => {
    it("returns the user from the repository", async () => {
      usersRepository.findByUsername.mockResolvedValue(user);

      await expect(service.findOneByUsername(user.username)).resolves.toEqual(user);
      expect(usersRepository.findByUsername).toHaveBeenCalledWith(user.username);
    });

    it("returns null when the user does not exist", async () => {
      usersRepository.findByUsername.mockResolvedValue(null);

      await expect(service.findOneByUsername("nobody")).resolves.toBeNull();
    });
  });
});
