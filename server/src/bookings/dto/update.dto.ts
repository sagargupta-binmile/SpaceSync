import { z } from 'zod';

export const UpdateSchema = z.object({
  booking_id: z.string().uuid(),
  room_id: z.string().uuid(),
  start_time: z.coerce.date(), // accepts ISO string and converts to Date
  end_time: z.coerce.date(),
});

export type UpdateDto = z.infer<typeof UpdateSchema>;
