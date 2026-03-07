import { Router } from "express";
import { z } from "zod";
import { getResourceById, getAllResources, saveResource } from "../db/resourceRepository.js";
import { createAvailabilitySlot, getAvailabilityByResource } from "../db/availabilityRepository.js";
import { freeSlotQuerySchema } from "./dto/freeSlotQuery.schema.js";
import { getAssignmentForResource } from "../db/assignmentRepository.js";
import { calculateAvailability } from "../CalculateAvailability.js";
import { createResourceSchema } from "./dto/createResource.schema.js";
import { availabilityRouter } from "./availability.routes.js";
import { calculateAvailabilityAnalytics } from "../AvailabilityAnalytics.js";


export const resourceRouter = Router();

resourceRouter.use('/:id/availability', availabilityRouter);

resourceRouter.get("/", (_req, res) => {
    const resources = getAllResources();
    return res.json(resources);
});

resourceRouter.post("/", (req, res) => {
    const parsed = createResourceSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            error: "Invalid input",
            details: z.treeifyError(parsed.error)
        });
    }

    saveResource(parsed.data);

    const existingAvailability = getAvailabilityByResource(parsed.data.id);
    if (existingAvailability.length === 0) {
        createAvailabilitySlot(
            parsed.data.id,
            new Date("2000-01-01T00:00:00.000Z"),
            new Date("2100-01-01T00:00:00.000Z")
        );
    }

    return res.status(201).json(parsed.data);
});

resourceRouter.get<{ id: string }>("/:id", (req, res) => {

    const { id } = req.params;

    const resource = getResourceById(id);
    if (!resource) {
        return res.status(404).json({
            error: "Resource not found"
        });
    }

    return res.json(resource);
});

resourceRouter.get<{ id: string }>('/:id/free-slots', (req, res) => {
    const { id } = req.params;
    const resource = getResourceById(id);

    const parsed = freeSlotQuerySchema.safeParse(req.query);

    if (!parsed.success) {
        return res.status(400).json({
            error: 'Invalid query parameters'
        });
    }

    const from = new Date(parsed.data.from);
    const to = new Date(parsed.data.to);

    const availability = getAvailabilityByResource(id);

    const assignments = getAssignmentForResource(
        id,
        from,
        to
    );

    const { freeSlot, clippedAvailability } = calculateAvailability(
        availability,
        assignments,
        from,
        to
    );

    const analytics = calculateAvailabilityAnalytics(
        clippedAvailability,
        freeSlot
    )

    return res.json({
        ...resource,
        availability: clippedAvailability,
        assignments,
        freeSlot,
        analytics
    });
});