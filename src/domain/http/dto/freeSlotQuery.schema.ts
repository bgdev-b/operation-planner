import { z } from 'zod';

export const freeSlotQuerySchema = z.object({
    from: z.iso.datetime(),
    to: z.iso.datetime(),
}).refine(
    data => new Date(data.from) < new Date(data.to),
    {
        error: "'From' must be before 'to'."
    }
);