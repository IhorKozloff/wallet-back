import express from 'express';
import DragonReviewerUserDataController from '../controllers/drago-reviewer.controller';
import asyncHandler from 'express-async-handler';
const router = express.Router();

router.get('/get', asyncHandler(DragonReviewerUserDataController.getUserData));
router.post('/add', asyncHandler(DragonReviewerUserDataController.addUserData));

export default router;