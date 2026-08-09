import { prisma } from "../../../prismaClient";

const createImmunisation = async (
  vaccineId: string,
  dueDate: Date,
  childId: string,
  userId: string,
) => {
  const child = await prisma.child.findFirst({
    where: { id: childId, userId },
  });

  if (!child) {
    const error = new Error("Access denied");
    (error as any).statusCode = 403;
    throw error;
  }

  return await prisma.immunisation.create({
    data: {
      vaccineId,
      dueDate,
      childId,
      administered: true
    },
  });
};

const getImmunisationsByChild = async (childId: string, userId: string) => {
  const child = await prisma.child.findFirst({
    where: { id: childId, userId },
  });

  if (!child) {
    const error = new Error("Access denied");
    (error as any).statusCode = 403;
    throw Error;
  }

  return await prisma.immunisation.findMany({
    where: { childId },
    orderBy: { dueDate: "asc" },
  });
};
const updateImmunisation = async (
  immunisationId: string,
  userId: string,
  administered: boolean,
) => {
  const immunisation = await prisma.immunisation.findFirst({
    where: {
      id: immunisationId,
      child: { userId },
    },
  });

  if (!immunisation) {
    const error = new Error("Access denied");
    (error as any).statusCode = 403;
    throw error;
  }

  return await prisma.immunisation.update({
    where: { id: immunisationId },
    data: { administered },
  });
};
const deleteImmunisation = async (immunisationId: string, userId: string) => {
  const immunisation = await prisma.immunisation.findFirst({
    where: {
      id: immunisationId,
      child: { userId },
    },
  });

  if (!immunisation) {
    const error = new Error("Access denied");
    (error as any).statusCode = 403;
    throw error;
  }

  await prisma.immunisation.delete({
    where: { id: immunisationId },
  });
};
const immunisationService = {
  createImmunisation,
  getImmunisationsByChild,
  updateImmunisation,
  deleteImmunisation,
};
export default immunisationService;
