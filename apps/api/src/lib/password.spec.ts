import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from './password.js';

describe('password', () => {
  it('produces a hash different from the plaintext', async () => {
    const hash = await hashPassword('correct-horse-battery-staple');
    expect(hash).not.toContain('correct-horse-battery-staple');
    expect(hash.startsWith('$argon2id$')).toBe(true);
  });

  it('verifies the same password it hashed', async () => {
    const hash = await hashPassword('P@ssw0rd!');
    expect(await verifyPassword(hash, 'P@ssw0rd!')).toBe(true);
  });

  it('rejects a wrong password', async () => {
    const hash = await hashPassword('P@ssw0rd!');
    expect(await verifyPassword(hash, 'wrong-password')).toBe(false);
  });

  it('generates different salts for the same password', async () => {
    const [a, b] = await Promise.all([hashPassword('same'), hashPassword('same')]);
    expect(a).not.toBe(b);
  });
});
