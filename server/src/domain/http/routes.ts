import { Router } from "express";
import { resourceRouter } from "./resources.routes.js";
import { assignmentRouter } from "./assignments.routes.js";


export const router = Router();

router.use('/resources', resourceRouter);
router.use('/assignments', assignmentRouter);

