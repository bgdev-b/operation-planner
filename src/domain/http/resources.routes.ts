import { Router } from "express";
import { createResourceSchema } from "./dto/createResource.schema.js";
import { saveResource } from "../db/resourceRepository.js";
import { getResourceById } from "../db/resourceRepository.js";
import z from "zod";
import { getAvailabilityByResource } from "../db/availabilityRepository.js";
import { getAssignmentForResource } from "../db/assignmentRepository.js";

export const resourceRouter = Router();

resourceRouter.post('/', (req, res) => {

    const parsed = createResourceSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            error: "Invalid input",
            details: z.treeifyError(parsed.error)
        });
    }

    const { id, type, name } = parsed.data;

    const existing = getResourceById(id);
    if (existing) {
        return res.status(409).json({
            error: 'Resource already exists'
        });
    }

    saveResource({
        id,
        name,
        type
    });

    return res.status(201).json({
        id,
        name,
        type
    });
});

resourceRouter.get('/:id', (req, res) => {
    const { id } = req.params;

    const resource = getResourceById(id);
    if (!resource) {
        return res.status(404).json({
            error: 'Resource not found'
        });
    }

    const availability = getAvailabilityByResource(id);
    const assignment = getAssignmentForResource(id);

    return res.json({
        ...resource,
        availability,
        assignment
    });
});
