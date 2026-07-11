import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../env.js';

export type TokenPayload = {
  sub: string;
  username: string;
};

const signOpts: SignOptions = {
  expiresIn: env.JWT_TTL as SignOptions['expiresIn'],
  issuer: 'skillswap',
};

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, signOpts);
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}
