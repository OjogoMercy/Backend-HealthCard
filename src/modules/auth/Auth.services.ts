import jwt from "jsonwebtoken";
import argon from "argon2";
import { prisma } from "../../../prismaClient";
import { AppError } from "../../utils/AppError";

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

const authService = { registerUser, loginUser, getUserProfile };
export default authService;
