import { Router } from "express";
import { resourceRouter } from "./resources.routes.js";
import { assignmentRouter } from "./assignments.routes.js";
import { availabilityRouter } from "./availability.routes.js";

export const router = Router();

router.use('/resource', resourceRouter);
router.use('/resource', availabilityRouter);
router.use('/assignments', assignmentRouter);

