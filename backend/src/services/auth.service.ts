import { prisma } from '../utils/prisma';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';
import crypto from 'crypto';

interface RegisterData {
  email: string;
  username: string;
  password: string;
  fullName?: string;
}

interface LoginData {
  email: string;
  password: string;
}

export class AuthService {
  async register(data: RegisterData) {
    const { email, username, password, fullName } = data;

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      throw new AppError(passwordValidation.errors.join(', '), 400);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new AppError('Email already registered', 409);
      }
      if (existingUser.username === username) {
        throw new AppError('Username already taken', 409);
      }
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        fullName,
      },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    // Create default preferences
    await prisma.userPreferences.create({
      data: {
        userId: user.id,
      },
    });

    // TODO: Send verification email

    return user;
  }

  async login(data: LoginData) {
    const { email, password } = data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.isActive) {
      throw new AppError('Invalid credentials', 401);
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email, user.username);

    const refreshTokenId = crypto.randomUUID();
    const refreshToken = generateRefreshToken(user.id, refreshTokenId);

    // Calculate expiry (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Store refresh token
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await prisma.refreshToken.create({
      data: {
        id: refreshTokenId,
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        emailVerified: user.emailVerified,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const decoded = verifyRefreshToken(refreshToken);

      // Check if token exists and is not revoked
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      const storedToken = await prisma.refreshToken.findFirst({
        where: {
          id: decoded.jti,
          tokenHash,
          revokedAt: null,
          expiresAt: {
            gt: new Date(),
          },
        },
        include: {
          user: true,
        },
      });

      if (!storedToken || !storedToken.user.isActive) {
        throw new AppError('Invalid refresh token', 401);
      }

      // Generate new access token
      const accessToken = generateAccessToken(
        storedToken.user.id,
        storedToken.user.email,
        storedToken.user.username
      );

      return { accessToken };
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      try {
        const decoded = verifyRefreshToken(refreshToken);
        await prisma.refreshToken.updateMany({
          where: {
            id: decoded.jti,
            userId,
          },
          data: {
            revokedAt: new Date(),
          },
        });
      } catch (error) {
        // Ignore errors during logout
      }
    } else {
      // Revoke all refresh tokens for user
      await prisma.refreshToken.updateMany({
        where: {
          userId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    }
  }
}
