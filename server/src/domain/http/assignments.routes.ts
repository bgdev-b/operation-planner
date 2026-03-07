import { Router } from "express";
import { z } from "zod";
import { assignmentDtoSchema } from "./dto/assignmentDto.js";
import { toAssignment } from "./dto/toAssignment.js";
import { getResourceById } from "../db/resourceRepository.js";
import { deleteAssignmentTime, getAssignmentForResource, saveAssignment, updateAssignmentTime } from "../db/assignmentRepository.js";
import { validateAssignment } from "../ValidateAssignment.js";
import { getAvailabilityByResource } from "../db/availabilityRepository.js";


export const assignmentRouter = Router();

assignmentRouter.post('/', (req, res, next) => {
    try {
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
    } catch (error) {
        return next(error);
    }
})

const moveAssignmentSchema = z.object({
    resourceId: z.string().min(1),
    originalStart: z.iso.datetime(),
    originalEnd: z.iso.datetime(),
    start: z.iso.datetime(),
    end: z.iso.datetime()
});

assignmentRouter.patch('/:taskId', (req, res, next) => {
    try {
        const { taskId } = req.params;
        const parsed = moveAssignmentSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                error: 'Invalid input',
                details: z.treeifyError(parsed.error)
            });
        }

        const { resourceId, originalStart, originalEnd, start, end } = parsed.data;

        const resource = getResourceById(resourceId);
        if (!resource) {
            return res.status(404).json({ error: 'Resource not found' });
        }

        const newAssignment = {
            taskId,
            resourceId,
            start: new Date(start),
            end: new Date(end)
        };

        const existingAssignments = getAssignmentForResource(resourceId)
            .filter(a =>
                !(a.taskId === taskId &&
                    a.start.getTime() === new Date(originalStart).getTime() &&
                    a.end.getTime() === new Date(originalEnd).getTime())
            );

        const availabilitySlots = getAvailabilityByResource(resourceId);

        const result = validateAssignment(
            availabilitySlots,
            existingAssignments,
            newAssignment
        );

        if (!result.valid) {
            return res.status(409).json(result);
        }

        const updated = updateAssignmentTime(
            taskId,
            resourceId,
            new Date(originalStart),
            new Date(originalEnd),
            new Date(start),
            new Date(end)
        );

        if (!updated) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        return next(error);
    }
})

const deleteAssignmentSchema = z.object({
    resourceId: z.string().min(1),
    start: z.iso.datetime(),
    end: z.iso.datetime()
});

assignmentRouter.delete('/:taskId', (req, res, next) => {
    try {
        const { taskId } = req.params;
        const parsed = deleteAssignmentSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                error: 'Invalid input',
                details: z.treeifyError(parsed.error)
            });
        }

        const { resourceId, start, end } = parsed.data;

        const resource = getResourceById(resourceId);
        if (!resource) {
            return res.status(404).json({ error: 'Resource not found' });
        }

        const deleted = deleteAssignmentTime(
            taskId,
            resourceId,
            new Date(start),
            new Date(end)
        );

        if (!deleted) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        return next(error);
    }
});