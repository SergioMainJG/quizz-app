/** Hashes and verifies passwords. Bound to a concrete algorithm in HashingModule. */
export abstract class PasswordHasher {
  abstract hash(password: string): Promise<string>;
  abstract verify(password: string, hash: string): Promise<boolean>;
}
