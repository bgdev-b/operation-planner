import { Router } from "express";
import { z } from "zod";
import { assignmentDtoSchema } from "./dto/assignmentDto.js";
import { toAssignment } from "./dto/toAssignment.js";
import { getResourceById } from "../db/resourceRepository.js";
import { getAssignmentForResource, saveAssignment } from "../db/assignmentRepository.js";
import { validateAssignment } from "../ValidateAssignment.js";
import { getAvailabilityByResource } from "../db/availabilityRepository.js";


export const assignmentRouter = Router();

assignmentRouter.post('/', (req, res) => {
    const parsed = assignmentDtoSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            error: 'Invalid input',
            details: z.treeifyError(parsed.error)
        });
    }

    const assignment = toAssignment(parsed.data);

    const resource = getResourceById(assignment.resourceId);
    if (!resource) {
        return res.status(404).json({
            error: 'Resource not found'
        });
    }

    const existingAssignment = getAssignmentForResource(resource.id);
    const availabilitySlot = getAvailabilityByResource(resource.id);

    const result = validateAssignment(
        availabilitySlot,
        existingAssignment,
        assignment
    );

    if (!result.valid) {
        return res.status(409).json(result);
    }

    saveAssignment(assignment);

    return res.status(201).json({ success: true });
})