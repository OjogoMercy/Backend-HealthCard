import jwt from "jsonwebtoken";
import argon from "argon2";
import { prisma } from "../../../prismaClient";
import { AppError } from "../../utils/AppError";
import crypto from "crypto";
import { OtpType } from "@prisma/client";
import { sendOtpEmail } from "../../services/MailService";

const registerUser = async (
  userName: string,
  email: string,
  password: string,
) => {
  const emailExists = await prisma.user.findUnique({ where: { email } });
  if (emailExists) {
    throw new AppError("This email already exists", 409);
  }
  const hashPassword = await argon.hash(password, {
    type: argon.argon2id,
    timeCost: 4,
    memoryCost: 65536,
    parallelism: 1,
  });
  await prisma.user.create({
    data: { userName, email, password: hashPassword },
  });
};

const loginUser = async (email: string, password: string) => {
  const foundUser = await prisma.user.findUnique({ where: { email } });
  if (!foundUser) {
    throw new AppError("User not found", 401);
  }

  const match = await argon.verify(foundUser.password, password);
  if (!match) {
    throw new AppError("Invalid password", 401);
  }

  const token = jwt.sign(
    { userId: foundUser.id, email: foundUser.email },
    process.env.JWT_SECRET as any,
    { expiresIn: "1d" },
  );

  return { token, userId: foundUser.id, userName: foundUser.userName };
};

const getUserProfile = async (userId: string) => {
  const userProfile = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      userName: true,
      id: true,
      email: true,
      children: true,
    },
  });

  if (!userProfile) {
    throw new AppError("User profile not found ", 404);
  }

  return userProfile;
};

const generateNumericOtp = (length: number = 6): string => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return crypto.randomInt(min, max + 1).toString();
};
const EXP_MINS = 10;

const SendOtp = async (email: string, type: OtpType) => {
  const existingOtp = await prisma.otp.findFirst({
    where: {
      email,
      type,
      expiresAt: { gt: new Date() },
    },
  });

  if (existingOtp) {
    const secondsRemaining = Math.ceil(
      (existingOtp.expiresAt.getTime() - Date.now()) / 1000,
    );
    if (secondsRemaining > (EXP_MINS - 1) * 60) {
      throw new AppError(
        "Please wait 60 seconds before requesting another code.",
        429,
      );
    }
  }

  await prisma.otp.deleteMany({
    where: { email, type },
  });
  const plainTextOtp = generateNumericOtp(6);
  const hashedCode = await argon.hash(plainTextOtp, {
    type: argon.argon2id,
    timeCost: 4,
    memoryCost: 19456,
  });
  sendOtpEmail(email, plainTextOtp);

  const expiresAt = new Date(Date.now() + EXP_MINS * 60 * 1000);
  await prisma.otp.create({
    data: { email, type, codeHash: hashedCode, expiresAt },
  });
};
const VerifyOtp = async (email: string, type: OtpType, code: string) => {
  const OtpRecord = await prisma.otp.findFirst({
    where: {
      email,
      type,
      expiresAt: { gt: new Date() },
    },
  });
  if (!OtpRecord) {
    throw new AppError("Otp has expired or dosent exist ", 404);
  }

  const isValid = await argon.verify(OtpRecord.codeHash, code);
  if (!isValid) {
    throw new AppError("OTP is not valid", 400);
  }
  await prisma.otp.delete({
    where: { id: OtpRecord.id },
  });
};
const authService = {
  registerUser,
  loginUser,
  getUserProfile,
  SendOtp,
  VerifyOtp,
};
export default authService;
