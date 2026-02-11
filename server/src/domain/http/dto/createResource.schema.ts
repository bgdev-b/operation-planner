import { z } from "zod";

export const createResourceSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    type: z.enum(['person', 'room', 'equipment'])
});