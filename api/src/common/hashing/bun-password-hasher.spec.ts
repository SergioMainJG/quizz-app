import { BunPasswordHasher } from "./bun-password-hasher.js";

describe("BunPasswordHasher", () => {
  const hasher = new BunPasswordHasher();

  it("never stores the plain password", async () => {
    const hash = await hasher.hash("correct-horse-battery");

    expect(hash).not.toContain("correct-horse-battery");
  });

  it("verifies the right password and rejects a wrong one", async () => {
    const hash = await hasher.hash("correct-horse-battery");

    await expect(hasher.verify("correct-horse-battery", hash)).resolves.toBe(true);
    await expect(hasher.verify("wrong-password", hash)).resolves.toBe(false);
  });
});
