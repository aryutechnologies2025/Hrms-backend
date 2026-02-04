import express from 'express';
import {
  adminChangePassword,
  createUser,
  loginUser,
  logoutUser,
  sendVerifyOtp,
  verifyOtp
} from '../controllers/authController.js';
import useAuth from '../middlewares/userAuth.js';
import { changePassword } from '../controllers/emplooyeeController.js';

const userRoutes = express.Router();

userRoutes.post('/register', createUser);
userRoutes.post('/login/:type', loginUser);
userRoutes.post('/logout', logoutUser);
userRoutes.post('/sent-verify-otp', useAuth, sendVerifyOtp);
userRoutes.post('/verify-otp', useAuth, verifyOtp);
userRoutes.post('/reset-verify-otp', useAuth, sendVerifyOtp);
userRoutes.put('/change-password',adminChangePassword);

//Export the userRoutes using ESM
export default userRoutes;
