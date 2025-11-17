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

    // Auto-subscribe to default categories
    const defaultCategories = await prisma.category.findMany();

    if (defaultCategories.length > 0) {
      const categorySubscriptions = defaultCategories.map(category => ({
        userId: user.id,
        categoryId: category.id,
        priority: 5, // Medium priority by default
        isActive: true,
      }));

      await prisma.userCategory.createMany({
        data: categorySubscriptions,
      });
    }

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

  async requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.isActive) {
      // Don't reveal if user exists for security
      return { message: 'If the email exists, a reset link will be sent' };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    // Store reset token
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: resetTokenHash,
        expiresAt,
      },
    });

    // TODO: Send password reset email with resetToken
    // In production, send email. For development only, uncomment below:
    // console.log(`Password reset token for ${email}: ${resetToken}`);

    return { message: 'If the email exists, a reset link will be sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    // Validate password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      throw new AppError(passwordValidation.errors.join(', '), 400);
    }

    // Hash the token to find it in the database
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find valid reset token
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!resetToken) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
      // Revoke all existing refresh tokens for security
      prisma.refreshToken.updateMany({
        where: {
          userId: resetToken.userId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      }),
    ]);

    return { message: 'Password reset successful' };
  }

  async sendVerificationEmail(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.emailVerified) {
      throw new AppError('Email already verified', 400);
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');
    const expiresAt = new Date(Date.now() + 86400000); // 24 hours

    // Store verification token
    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    // TODO: Send verification email with verificationToken
    // In production, send email. For development only, uncomment below:
    // console.log(`Email verification token for ${user.email}: ${verificationToken}`);

    return { message: 'Verification email sent' };
  }

  async verifyEmail(token: string) {
    // Hash the token to find it in the database
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find valid verification token
    const verificationToken = await prisma.emailVerificationToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!verificationToken) {
      throw new AppError('Invalid or expired verification token', 400);
    }

    // Update user and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: verificationToken.userId },
        data: { emailVerified: true },
      }),
      prisma.emailVerificationToken.update({
        where: { id: verificationToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    // Generate tokens for automatic login
    const accessToken = generateAccessToken(
      verificationToken.user.id,
      verificationToken.user.email,
      verificationToken.user.username
    );

    const refreshTokenId = crypto.randomUUID();
    const refreshToken = generateRefreshToken(verificationToken.user.id, refreshTokenId);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await prisma.refreshToken.create({
      data: {
        id: refreshTokenId,
        userId: verificationToken.user.id,
        tokenHash: refreshTokenHash,
        expiresAt,
      },
    });

    return {
      user: {
        id: verificationToken.user.id,
        email: verificationToken.user.email,
        username: verificationToken.user.username,
        fullName: verificationToken.user.fullName,
        avatarUrl: verificationToken.user.avatarUrl,
        emailVerified: true,
      },
      accessToken,
      refreshToken,
    };
  }
}
