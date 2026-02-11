import { z } from 'zod';

export const createAvailabilitySchema = z.object({
    start: z.iso.datetime(),
    end: z.iso.datetime()
});


