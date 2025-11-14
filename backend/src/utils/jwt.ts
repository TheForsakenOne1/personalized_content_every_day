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

  const options: SignOptions = {
    expiresIn: config.jwtAccessExpiry,
  };

  return jwt.sign(payload, config.jwtSecret, options);
};

export const generateRefreshToken = (userId: string, tokenId: string): string => {
  const payload = {
    sub: userId,
    jti: tokenId,
    type: 'refresh',
  };

  const options: SignOptions = {
    expiresIn: config.jwtRefreshExpiry,
  };

  return jwt.sign(payload, config.jwtSecret, options);
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
