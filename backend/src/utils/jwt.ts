import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config';
import { JwtPayload } from '../middleware/auth';

export const generateAccessToken = (userId: string, email: string, username: string): string => {
  const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
    sub: userId,
    email,
    username,
    type: 'access',
  };

  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtAccessExpiry,
  } as SignOptions);
};

export const generateRefreshToken = (userId: string, tokenId: string): string => {
  const payload = {
    sub: userId,
    jti: tokenId,
    type: 'refresh',
  };

  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtRefreshExpiry,
  } as SignOptions);
};

export const verifyRefreshToken = (token: string): { sub: string; jti: string } => {
  const decoded = jwt.verify(token, config.jwtSecret) as any;

  if (decoded.type !== 'refresh') {
    throw new Error('Invalid token type');
  }

  return {
    sub: decoded.sub,
    jti: decoded.jti,
  };
};
