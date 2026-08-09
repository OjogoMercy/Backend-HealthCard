import { NextFunction, Request, Response } from "express";
import type { AuthenticatedRequest } from "../../types/express";
import immunisationService from "./immunisations.services";

const createImmunisation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authReq = req as unknown as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { vaccineId, dueDate, childId } = authReq.body;
    if (!dueDate) {
      return res.status(400).json({ message: "Due date is required" });
    } else if (!childId) {
      return res.status(400).json({ message: "Child ID is required" });
    } else if (!vaccineId) {
      return res.status(400).json({ message: "Vaccine ID is required" });
    }

    if (isNaN(new Date(dueDate).getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const immunisation = await immunisationService.createImmunisation(
      vaccineId,
      new Date(dueDate),
      childId,
      userId,
    );

    return res.status(201).json({
      message: "Immunisation created successfully",
      immunisation,
    });
  } catch (error) {
    next(error);
  }
};

const getImmunisationsByChild = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authReq = req as unknown as AuthenticatedRequest;
    const { childId } = authReq.params;
    const userId = authReq.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const immunisations = await immunisationService.getImmunisationsByChild(
      childId as string,
      userId,
    );
    return res
      .status(200)
      .json({ message: "List of immunisations", immunisations });
  } catch (error) {
    next(error);
  }
};

const handleDeleteImmunisation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authReq = req as unknown as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { immunisationId } = authReq.params;
    await immunisationService.deleteImmunisation(
      immunisationId as string,
      userId,
    );
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const handleUpdateImmunisation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authReq = req as unknown as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { immunisationId } = authReq.params;
    const { administered } = authReq.body;

    if (administered === undefined) {
      return res
        .status(400)
        .json({ message: "Please provide the administered field" });
    }

    const updated = await immunisationService.updateImmunisation(
      immunisationId as string,
      userId,
      administered,
    );

    if (!updated) {
      return res
        .status(404)
        .json({ message: "Immunisation record not found or access denied" });
    }

    return res.status(200).json({
      message: "Immunisation updated successfully",
      immunisation: updated,
    });
  } catch (error) {
    next(error);
  }
};
const immunisationController = {
  createImmunisation,
  getImmunisationsByChild,
  handleDeleteImmunisation,
  handleUpdateImmunisation,
};
export default immunisationController;
