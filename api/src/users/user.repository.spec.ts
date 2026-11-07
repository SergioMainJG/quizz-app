import { ConflictException } from "@nestjs/common";
import { getDrizzleToken } from "@nestjs/drizzle";
import { Test } from "@nestjs/testing";
import { sql } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createTestDb } from "../../test/helpers/test-db.js";
import type { SignUpSchemaDto } from "../auth/schema/sign-up.schema.js";
import { UsersRepository } from "./users.repository.js";

const newUser = (overrides: Partial<SignUpSchemaDto> = {}) =>
  ({
    username: "jose",
    email: "jose@example.com",
    password: "hashed",
    ...overrides,
  }) as SignUpSchemaDto;

describe("UsersRepository", () => {
  let testDb: Awaited<ReturnType<typeof createTestDb>>;
  let repo: UsersRepository;

  beforeAll(async () => {
    testDb = await createTestDb();
    const moduleRef = await Test.createTestingModule({
      providers: [UsersRepository, { provide: getDrizzleToken(), useValue: testDb.db }],
    }).compile();
    repo = moduleRef.get(UsersRepository);
  }, 30_000);

  beforeEach(async () => {
    await testDb.db.execute(sql`TRUNCATE users CASCADE`);
  });

  afterAll(() => testDb?.close());

  it("create assign rol PLAYER and return the row", async () => {
    const created = await repo.create(newUser());
    expect(created).toMatchObject({ username: "jose", email: "jose@example.com", role: "PLAYER" });
    expect(created.id).toBeTypeOf("string");
  });

  it("create reject username", async () => {
    await repo.create(newUser());
    await expect(repo.create(newUser({ email: "otro@example.com" }))).rejects.toThrow(
      ConflictException,
    );
  });

  it("create reject email", async () => {
    await repo.create(newUser());
    await expect(repo.create(newUser({ username: "otro" }))).rejects.toThrow(ConflictException);
  });

  it("check constraint for email", async () => {
    await expect(repo.create(newUser({ email: "no-es-email" }))).rejects.toThrow();
  });

  it("findById and findByUsername don't return password", async () => {
    const { id } = await repo.create(newUser());
    expect(await repo.findById(id)).not.toHaveProperty("password");
    expect(await repo.findByUsername("jose")).not.toHaveProperty("password");
  });

  it("find* return null if user doesn't exists", async () => {
    expect(await repo.findById(crypto.randomUUID())).toBeNull();
    expect(await repo.findByUsername("nadie")).toBeNull();
    expect(await repo.findByEmail("nadie@example.com")).toBeNull();
  });

  it("updatePasswordHash change the hash hash", async () => {
    const { id } = await repo.create(newUser());
    await repo.updatePasswordHash(id, "nuevo-hash");
    expect((await repo.findByEmail("jose@example.com"))?.password).toBe("nuevo-hash");
  });

  it("delete user", async () => {
    const { id } = await repo.create(newUser());
    await repo.delete(id);
    expect(await repo.findById(id)).toBeNull();
  });
});
