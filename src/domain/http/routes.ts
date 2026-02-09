import { Router } from "express";
import { z } from "zod";
import { validateAssignment } from "../ValidateAssignment.js";
import { Resource } from "../Resource.js";
import { Assignment } from "../Assignment.js";
import { getResourceById } from "../db/resourceRepository.js";
import { getAssignmentForResource, saveAssignment } from "../db/assignmentRepository.js";
import { assignmentDtoSchema } from "./dto/assignmentDto.js";
import { toAssignment } from "./dto/toAssignment.js";

export const router = Router();

router.post('/validate-assignment', (req, res) => {
    const { resource, existingAssignment, newAssignment } = req.body as {
        resource: Resource;
        existingAssignment: Assignment[];
        newAssignment: Assignment;
    };

    const result = validateAssignment(
        resource,
        existingAssignment,
        newAssignment
    );

    return res.json(result);
});

router.post('/assign', (req, res) => {
    const parsed = assignmentDtoSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            error: 'Invalid input',
            details: z.prettifyError(parsed.error)
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

    const result = validateAssignment(
        resource,
        existingAssignment,
        assignment
    );

    if (!result.valid) {
        return res.status(400).json(result);
    }

    saveAssignment(assignment);

    return res.status(201).json({ success: true });
});