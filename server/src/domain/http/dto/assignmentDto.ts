import { z } from "zod";

export const assignmentDtoSchema = z.object({
    taskId: z.string().min(1),
    resourceId: z.string().min(1),
    start: z.iso.datetime(),
    end: z.iso.datetime()
});

export type AssignmentDto = z.infer<typeof assignmentDtoSchema>