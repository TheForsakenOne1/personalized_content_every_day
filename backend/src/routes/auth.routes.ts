import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();
const authController = new AuthController();

router.post('/register', authRateLimiter, authController.register.bind(authController));
router.post('/login', authRateLimiter, authController.login.bind(authController));
router.post('/refresh', authController.refresh.bind(authController));
router.post('/logout', authenticate, authController.logout.bind(authController));
router.get('/me', authenticate, authController.me.bind(authController));

// Password reset
router.post('/forgot-password', authRateLimiter, authController.requestPasswordReset.bind(authController));
router.post('/reset-password', authRateLimiter, authController.resetPassword.bind(authController));

// Email verification
router.post('/send-verification', authenticate, authController.sendVerificationEmail.bind(authController));
router.post('/verify-email', authController.verifyEmail.bind(authController));

export default router;
