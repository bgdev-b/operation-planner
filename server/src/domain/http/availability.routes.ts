import { Router } from "express";
import { z } from "zod";
import { getResourceById } from "../db/resourceRepository.js";
import { createAvailabilitySlot, getAvailabilityByResource } from "../db/availabilityRepository.js";
import { createAvailabilitySchema } from "./dto/createAvailability.schema.js";
import { detectInvalidTimeRange } from "../Rules.js";


export const availabilityRouter = Router();

availabilityRouter.post('/:id/availability', (req, res) => {

    const parsed = createAvailabilitySchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            error: "Invalid input",
            details: z.treeifyError(parsed.error)
        });
    }

    const { id } = req.params;
    const { start, end } = parsed.data;

    const resource = getResourceById(id);
    if (!resource) {
        return res.status(404).json({ error: "Resource not found" });
    }

    const newSlot = {
        resourceId: id,
        start: new Date(start),
        end: new Date(end)
    };

    const invalidRange = detectInvalidTimeRange({
        taskId: 'availability',
        resourceId: id,
        start: newSlot.start,
        end: newSlot.end
    });

    if (invalidRange) {
        return res.status(400).json(invalidRange);
    }

    const existingSlot = getAvailabilityByResource(id);

    const overlaps = existingSlot.some(slot =>
        newSlot.start < slot.end &&
        newSlot.end > slot.start
    );

    if (overlaps) {
        return res.status(409).json({
            error: 'Availability overlaps with existing slot'
        });
    }

    const created = createAvailabilitySlot(
        id,
        newSlot.start,
        newSlot.end
    );

    return res.status(201).json(created);

})
