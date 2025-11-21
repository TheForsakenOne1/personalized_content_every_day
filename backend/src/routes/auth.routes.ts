import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimiter';
import { validateBody } from '../middleware/validate';
import { schemas } from '../validation/schemas';

const router = Router();
const authController = new AuthController();

router.post('/register', authRateLimiter, validateBody(schemas.register), authController.register.bind(authController));
router.post('/login', authRateLimiter, validateBody(schemas.login), authController.login.bind(authController));
router.post('/refresh', validateBody(schemas.refreshToken), authController.refresh.bind(authController));
router.post('/logout', authenticate, authController.logout.bind(authController));
router.get('/me', authenticate, authController.me.bind(authController));

// Password reset
router.post('/forgot-password', authRateLimiter, validateBody(schemas.forgotPassword), authController.requestPasswordReset.bind(authController));
router.post('/reset-password', authRateLimiter, validateBody(schemas.resetPassword), authController.resetPassword.bind(authController));

// Email verification
router.post('/send-verification', authenticate, authController.sendVerificationEmail.bind(authController));
router.post('/verify-email', validateBody(schemas.verifyEmail), authController.verifyEmail.bind(authController));

export default router;
