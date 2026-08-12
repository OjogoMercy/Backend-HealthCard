import { Request, Response, NextFunction } from "express";
import authService from "./Auth.services";
import { OtpType } from "@prisma/client";

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userName, email, password } = req.body;
    if (!userName || !email || !password) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    await authService.registerUser(userName, email, password);
    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    next(error);
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    const { token, userId, userName } = await authService.loginUser(
      email,
      password,
    );

    return res
      .status(200)
      .json({ message: "Login successful", token, userId, userName });
  } catch (error) {
    next(error);
  }
};

const profile = async (
  req: Request & { user?: { userId: string } },
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const userProfile = await authService.getUserProfile(req.user.userId);
    return res.status(200).json({
      message: "User profile retrieved successfully",
      profile: userProfile,
    });
  } catch (error) {
    next(error);
  }
};

const requestOtpHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, type } = req.body;

    if (!email || !type) {
      return res.status(400).json({ message: "Email and type are required." });
    }
    if (!Object.values(OtpType).includes(type)) {
      return res.status(400).json({ message: "Invalid OTP type provided." });
    }

    await authService.SendOtp(email, type as OtpType);

    return res.status(200).json({
      success: true,
      message: "Verification code sent successfully.",
    });
  } catch (error) {
    next(error);
  }
};

const verifyOtpHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, code, type } = req.body;

    if (!email || !code || !type) {
      return res.status(400).json({
        message: "Email, code, and type are required.",
      });
    }

    await authService.VerifyOtp(email, type as OtpType, code);

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully.",
    });
  } catch (error) {
    next(error);
  }
};

const authController = {
  register,
  login,
  profile,
  requestOtpHandler,
  verifyOtpHandler,
};

export default authController;
