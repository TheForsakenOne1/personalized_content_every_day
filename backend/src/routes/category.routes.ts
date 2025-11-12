import { Router } from 'express';
import { optionalAuth } from '../middleware/auth';

const router = Router();

// Placeholder routes - will be implemented later
router.get('/', optionalAuth, (req, res) => {
  res.json({ success: true, data: { message: 'Categories endpoint' } });
});

export default router;
