import { prisma } from "../../../prismaClient";
import { AppError } from "../../utils/AppError";

const createChild = async (
  name: string,
  dateOfBirth: Date,
  gender: string,
  userId: string,
) => {
  const existing = await prisma.child.findFirst({
    where: {
      userId,
      name: { equals: name, mode: "insensitive" },
      dateOfBirth,
    },
  });

  if (existing) {
    throw new AppError(
      "A child with this name and date of birth already exists",
      409,
    );
  }

  const newChild = await prisma.child.create({
    data: {
      name,
      dateOfBirth,
      gender,
      userId,
    },
  });

  return newChild;
};
const getChildrenByUserId = async (userId: string) => {
  const children = await prisma.child.findMany({
    where: {
      userId: userId,
    },
  });
  return children;
};
const getGrowthRecords = async (childId: string, userId: string) => {
  const child = await prisma.child.findFirst({
    where: {
      id: childId,
      userId: userId,
    },
  });
  if (!child) {
    throw new AppError("child not found", 404);
  }
  const growthRecord = await prisma.growthRecord.findMany({
    where: { childId },
  });
  return growthRecord;
};

const childService = { createChild, getChildrenByUserId, getGrowthRecords };
export default childService;
